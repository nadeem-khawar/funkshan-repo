/**
 * Event Service
 * Handles event-related business logic
 */

import type { PrismaClient, Prisma } from '@funkshan/database';
import { InviteStatus } from '@funkshan/database';
import type {
    CreateEventRequest,
    EventWithGuestsResponse,
    EventListItem,
    EventFilter,
    HomeEventsData,
    PaginationMeta,
    CreateGuest,
    CreateCheckinAgent,
} from '@funkshan/api-contracts';
import { randomString } from '@funkshan/utils';
import { JobPublisher, QUEUES, EventPublishedJob } from '@funkshan/messaging';

export class EventService {
    private publisher: JobPublisher;

    constructor(
        private prisma: PrismaClient,
        publisher?: JobPublisher
    ) {
        this.publisher = publisher || new JobPublisher();
    }

    /**
     * Publish event.published message to RabbitMQ
     */
    private async publishEventCreated(event: {
        id: string;
        userId: string;
        name: string;
        dateTime: Date;
        guestCount: number;
    }): Promise<void> {
        try {
            const message: EventPublishedJob = {
                type: 'event.published',
                eventId: event.id,
                userId: event.userId,
                eventName: event.name,
                eventDateTime: event.dateTime.toISOString(),
                guestCount: event.guestCount,
                timestamp: Date.now(),
            };

            await this.publisher.publish(QUEUES.EVENT_PUBLISHED, message, {
                persistent: true,
                priority: 5,
            });

            console.log(
                `Published event.published message for event ${event.id}`
            );
        } catch (error) {
            console.error('Failed to publish event message:', error);
            // Don't throw - we don't want to fail the event creation if messaging fails
            // The event is already created in DB, messaging should be handled separately
        }
    }

    /**
     * Create a new event with guests and checkin agents
     */
    async createEvent(
        userId: string,
        eventData: CreateEventRequest
    ): Promise<EventWithGuestsResponse> {
        const { venue, guests, checkinAgents, entryMechanism, ...eventFields } =
            eventData;

        // Generate QR code and PIN if entry mechanism is specified
        let qrCode: string | undefined;
        let pinCode: string | undefined;

        if (entryMechanism) {
            if (entryMechanism === 'QR_CODE' || entryMechanism === 'BOTH') {
                qrCode = randomString(32); // Generate unique QR code
            }
            if (entryMechanism === 'PIN_CODE' || entryMechanism === 'BOTH') {
                pinCode = randomString(6, true); // Generate 6-digit PIN
            }
        }

        // Create event with nested guests and checkin agents in a transaction
        const event = await this.prisma.event.create({
            data: {
                userId,
                name: eventFields.name,
                dateTime: eventFields.dateTime,
                details: eventFields.details ?? null,
                eventImagePath: eventFields.eventImagePath ?? null,
                backgroundImagePath: eventFields.backgroundImagePath ?? null,
                venueAddress: venue.address,
                venueLatitude: venue.latitude ?? null,
                venueLongitude: venue.longitude ?? null,
                venueTimezone: venue.timezone,
                venueLocationImagePath: venue.locationImagePath ?? null,
                venueMapImagePath: venue.mapImagePath ?? null,
                entryMechanism: entryMechanism ?? null,
                qrCode: qrCode ?? null,
                pinCode: pinCode ?? null,
                dressCode: eventFields.dressCode ?? null,
                giftSuggestions: eventFields.giftSuggestions ?? null,
                isDraft: eventFields.isDraft,
                publishedAt: eventFields.isDraft ? null : new Date(),
                guests: {
                    create: guests.map((guest: CreateGuest) => ({
                        name: guest.name,
                        email: guest.email ?? null,
                        phoneNumber: guest.phoneNumber ?? null,
                        inviteType: guest.inviteType,
                        notes: guest.notes ?? null,
                    })),
                },
                checkinAgents: {
                    create: checkinAgents.map((agent: CreateCheckinAgent) => ({
                        userId: agent.userId,
                    })),
                },
            },
            include: {
                guests: true,
                checkinAgents: true,
            },
        });

        // If event is not a draft, publish message to RabbitMQ
        if (!eventFields.isDraft) {
            await this.publishEventCreated({
                id: event.id,
                userId: event.userId,
                name: event.name,
                dateTime: event.dateTime,
                guestCount: event.guests.length,
            });
        }

        // Transform to response format
        return this.transformEventToResponse(event);
    }

    /**
     * Get home page data with all event lists
     */
    async getHomeEvents(
        userId: string,
        limit: number = 10
    ): Promise<HomeEventsData> {
        const now = new Date();

        // Run queries in parallel
        const [upcoming, awaiting, accepted, sent, drafts] = await Promise.all([
            // Upcoming events (events I created that are not drafts)
            this.prisma.event.findMany({
                where: {
                    userId,
                    isDraft: false,
                    isActive: true,
                    dateTime: { gte: now },
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                        },
                    },
                },
                orderBy: { dateTime: 'asc' },
                take: limit,
            }),

            // Events where I'm invited and status is PENDING or SENT
            this.getEventsByGuestStatus(userId, ['PENDING', 'SENT'], limit),

            // Events where I accepted the invitation
            this.getEventsByGuestStatus(userId, ['ACCEPTED'], limit),

            // Events I sent (same as upcoming + past events)
            this.getMyEvents(userId, false, limit),

            // Draft events
            this.getMyEvents(userId, true, limit),
        ]);

        return {
            upcoming: upcoming.map(this.transformToListItem),
            awaiting: awaiting,
            accepted: accepted,
            sent: sent,
            drafts: drafts,
        };
    }

    /**
     * Get filtered list of events with pagination
     */
    async getEvents(
        userId: string,
        filter: EventFilter,
        page: number = 1,
        limit: number = 10,
        search?: string
    ): Promise<{ items: EventListItem[]; pagination: PaginationMeta }> {
        const now = new Date();

        switch (filter) {
            case 'upcoming':
                return this.getMyEvents(userId, false, limit, page, search, {
                    dateTime: { gte: now },
                });

            case 'awaiting':
                return this.getEventsByGuestStatus(
                    userId,
                    ['PENDING', 'SENT'],
                    limit,
                    page,
                    search
                );

            case 'accepted':
                return this.getEventsByGuestStatus(
                    userId,
                    ['ACCEPTED'],
                    limit,
                    page,
                    search
                );

            case 'sent':
                return this.getMyEvents(userId, false, limit, page, search);

            case 'drafts':
                return this.getMyEvents(userId, true, limit, page, search);

            default:
                throw new Error(`Invalid filter: ${filter}`);
        }
    }

    /**
     * Get events created by the user
     */
    private async getMyEvents(
        userId: string,
        isDraft: boolean,
        limit: number,
        page: number = 1,
        search?: string,
        additionalWhere?: Prisma.EventWhereInput
    ): Promise<{ items: EventListItem[]; pagination: PaginationMeta }> {
        const skip = (page - 1) * limit;

        const where: Prisma.EventWhereInput = {
            userId,
            isDraft,
            isActive: true,
            ...additionalWhere,
            ...(search && {
                name: {
                    contains: search,
                    mode: 'insensitive' as Prisma.QueryMode,
                },
            }),
        };

        const [events, total] = await Promise.all([
            this.prisma.event.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                        },
                    },
                },
                orderBy: { dateTime: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.event.count({ where }),
        ]);

        return {
            items: events.map(this.transformToListItem),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Get events where user is a guest with specific invite status
     */
    private async getEventsByGuestStatus(
        userId: string,
        statuses: InviteStatus[],
        limit: number,
        page: number = 1,
        search?: string
    ): Promise<{ items: EventListItem[]; pagination: PaginationMeta }> {
        const skip = (page - 1) * limit;

        // Get user's email to find invitations
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { email: true },
        });

        if (!user) {
            throw new Error('User not found');
        }

        const where: Prisma.EventWhereInput = {
            isActive: true,
            isDraft: false,
            guests: {
                some: {
                    email: user.email,
                    inviteStatus: { in: statuses },
                },
            },
            ...(search && {
                name: {
                    contains: search,
                    mode: 'insensitive' as Prisma.QueryMode,
                },
            }),
        };

        const [events, total] = await Promise.all([
            this.prisma.event.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                        },
                    },
                },
                orderBy: { dateTime: 'asc' },
                skip,
                take: limit,
            }),
            this.prisma.event.count({ where }),
        ]);

        return {
            items: events.map(this.transformToListItem),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Transform event to list item format
     */
    private transformToListItem(event: any): EventListItem {
        return {
            id: event.id,
            name: event.name,
            dateTime: event.dateTime,
            timezone: event.venueTimezone,
            eventImagePath: event.eventImagePath,
            isDraft: event.isDraft,
            createdBy: {
                id: event.user.id,
                firstName: event.user.firstName,
                lastName: event.user.lastName,
                email: event.user.email,
            },
            createdAt: event.createdAt,
        };
    }

    /**
     * Transform event to full response format
     */
    private transformEventToResponse(event: any): EventWithGuestsResponse {
        return {
            id: event.id,
            userId: event.userId,
            name: event.name,
            dateTime: event.dateTime,
            details: event.details,
            eventImagePath: event.eventImagePath,
            backgroundImagePath: event.backgroundImagePath,
            venue: {
                address: event.venueAddress,
                latitude: event.venueLatitude,
                longitude: event.venueLongitude,
                timezone: event.venueTimezone,
                locationImagePath: event.venueLocationImagePath,
                mapImagePath: event.venueMapImagePath,
            },
            entryMechanism: event.entryMechanism,
            qrCode: event.qrCode,
            pinCode: event.pinCode,
            dressCode: event.dressCode,
            giftSuggestions: event.giftSuggestions,
            isDraft: event.isDraft,
            publishedAt: event.publishedAt,
            isActive: event.isActive,
            createdAt: event.createdAt,
            updatedAt: event.updatedAt,
            guests: event.guests.map((guest: any) => ({
                id: guest.id,
                eventId: guest.eventId,
                name: guest.name,
                email: guest.email,
                phoneNumber: guest.phoneNumber,
                inviteType: guest.inviteType,
                inviteStatus: guest.inviteStatus,
                inviteSentAt: guest.inviteSentAt,
                inviteRespondedAt: guest.inviteRespondedAt,
                hasCheckedIn: guest.hasCheckedIn,
                checkedInAt: guest.checkedInAt,
                notes: guest.notes,
                createdAt: guest.createdAt,
                updatedAt: guest.updatedAt,
            })),
            checkinAgents: event.checkinAgents.map((agent: any) => ({
                id: agent.id,
                eventId: agent.eventId,
                userId: agent.userId,
                assignedAt: agent.assignedAt,
            })),
        };
    }
}
