/**
 * Event Repository
 */

import type { PrismaClient, Event, Prisma } from '@prisma/client';
import { BaseRepository } from './base';

export interface CreateEventData {
    userId: string;
    name: string;
    dateTime: Date;
    details?: string;
    eventImagePath?: string;
    backgroundImagePath?: string;
    venueAddress: string;
    venueLatitude?: number;
    venueLongitude?: number;
    venueTimezone: string; // IANA timezone identifier (e.g., "America/New_York")
    venueLocationImagePath?: string;
    venueMapImagePath?: string;
    entryMechanism?: 'QR_CODE' | 'PIN_CODE' | 'BOTH';
    qrCode?: string;
    pinCode?: string;
    dressCode?: string;
    giftSuggestions?: string;
    isDraft?: boolean; // Default true, set to false when publishing
}

export interface UpdateEventData {
    name?: string;
    dateTime?: Date;
    details?: string;
    eventImagePath?: string;
    backgroundImagePath?: string;
    venueAddress?: string;
    venueLatitude?: number;
    venueLongitude?: number;
    venueTimezone?: string; // IANA timezone identifier
    venueLocationImagePath?: string;
    venueMapImagePath?: string;
    entryMechanism?: 'QR_CODE' | 'PIN_CODE' | 'BOTH';
    qrCode?: string;
    pinCode?: string;
    dressCode?: string;
    giftSuggestions?: string;
    isDraft?: boolean;
    publishedAt?: Date;
    isActive?: boolean;
}

export interface EventWithRelations extends Event {
    guests?: any[];
    checkinAgents?: any[];
}

export class EventRepository extends BaseRepository<
    Event,
    Prisma.EventCreateInput,
    Prisma.EventUpdateInput
> {
    protected modelName = 'event';

    constructor(prisma: PrismaClient) {
        super(prisma);
    }

    /**
     * Create a new event
     */
    async createEvent(eventData: CreateEventData): Promise<Event> {
        try {
            const event = await this.model.create({
                data: {
                    ...eventData,
                    user: {
                        connect: { id: eventData.userId },
                    },
                },
            });

            return event;
        } catch (error) {
            this.handleError(error, 'createEvent');
        }
    }

    /**
     * Find event by ID with all relations (optimized for retrieving all data together)
     */
    async findByIdWithRelations(
        eventId: string
    ): Promise<EventWithRelations | null> {
        try {
            return await this.model.findUnique({
                where: { id: eventId },
                include: {
                    guests: {
                        orderBy: {
                            name: 'asc',
                        },
                    },
                    checkinAgents: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    firstName: true,
                                    lastName: true,
                                    email: true,
                                    role: true,
                                },
                            },
                        },
                    },
                },
            });
        } catch (error) {
            this.handleError(error, 'findByIdWithRelations');
        }
    }

    /**
     * Find all events for a user
     */
    async findByUserId(
        userId: string,
        includeInactive = false
    ): Promise<Event[]> {
        try {
            const where: Prisma.EventWhereInput = {
                userId,
                ...(includeInactive ? {} : { isActive: true }),
            };

            return await this.model.findMany({
                where,
                orderBy: {
                    dateTime: 'desc',
                },
            });
        } catch (error) {
            this.handleError(error, 'findByUserId');
        }
    }

    /**
     * Find upcoming events for a user
     */
    async findUpcomingEvents(userId: string): Promise<Event[]> {
        try {
            return await this.model.findMany({
                where: {
                    userId,
                    isActive: true,
                    dateTime: {
                        gte: new Date(),
                    },
                },
                orderBy: {
                    dateTime: 'asc',
                },
            });
        } catch (error) {
            this.handleError(error, 'findUpcomingEvents');
        }
    }

    /**
     * Find past events for a user
     */
    async findPastEvents(userId: string): Promise<Event[]> {
        try {
            return await this.model.findMany({
                where: {
                    userId,
                    isActive: true,
                    dateTime: {
                        lt: new Date(),
                    },
                },
                orderBy: {
                    dateTime: 'desc',
                },
            });
        } catch (error) {
            this.handleError(error, 'findPastEvents');
        }
    }

    /**
     * Update an event
     */
    async updateEvent(eventId: string, data: UpdateEventData): Promise<Event> {
        try {
            return await this.model.update({
                where: { id: eventId },
                data,
            });
        } catch (error) {
            this.handleError(error, 'updateEvent');
        }
    }

    /**
     * Soft delete an event (set isActive to false)
     */
    async softDelete(eventId: string): Promise<Event> {
        try {
            return await this.model.update({
                where: { id: eventId },
                data: { isActive: false },
            });
        } catch (error) {
            this.handleError(error, 'softDelete');
        }
    }

    /**
     * Find event by QR code
     */
    async findByQrCode(qrCode: string): Promise<Event | null> {
        try {
            return await this.model.findFirst({
                where: {
                    qrCode,
                    isActive: true,
                },
            });
        } catch (error) {
            this.handleError(error, 'findByQrCode');
        }
    }

    /**
     * Verify event access by PIN code
     */
    async verifyPinCode(eventId: string, pinCode: string): Promise<boolean> {
        try {
            const event = await this.model.findUnique({
                where: { id: eventId },
                select: { pinCode: true },
            });

            return event?.pinCode === pinCode;
        } catch (error) {
            this.handleError(error, 'verifyPinCode');
        }
    }

    /**
     * Publish a draft event (set isDraft to false and set publishedAt)
     */
    async publishEvent(eventId: string): Promise<Event> {
        try {
            return await this.model.update({
                where: { id: eventId },
                data: {
                    isDraft: false,
                    publishedAt: new Date(),
                },
            });
        } catch (error) {
            this.handleError(error, 'publishEvent');
        }
    }

    /**
     * Find draft events for a user
     */
    async findDraftEvents(userId: string): Promise<Event[]> {
        try {
            return await this.model.findMany({
                where: {
                    userId,
                    isDraft: true,
                    isActive: true,
                },
                orderBy: {
                    updatedAt: 'desc',
                },
            });
        } catch (error) {
            this.handleError(error, 'findDraftEvents');
        }
    }

    /**
     * Find published events for a user
     */
    async findPublishedEvents(userId: string): Promise<Event[]> {
        try {
            return await this.model.findMany({
                where: {
                    userId,
                    isDraft: false,
                    isActive: true,
                },
                orderBy: {
                    dateTime: 'desc',
                },
            });
        } catch (error) {
            this.handleError(error, 'findPublishedEvents');
        }
    }

    /**
     * Convert event back to draft
     */
    async unpublishEvent(eventId: string): Promise<Event> {
        try {
            return await this.model.update({
                where: { id: eventId },
                data: {
                    isDraft: true,
                    publishedAt: null,
                },
            });
        } catch (error) {
            this.handleError(error, 'unpublishEvent');
        }
    }
}
