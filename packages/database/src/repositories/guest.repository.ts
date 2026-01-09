/**
 * Guest Repository
 */

import type { PrismaClient, Guest, Prisma } from '@prisma/client';
import { BaseRepository } from './base';

export interface CreateGuestData {
    eventId: string;
    name: string;
    email?: string;
    phoneNumber?: string;
    inviteType?:
        | 'GUEST_ONLY'
        | 'PLUS_ONE'
        | 'PLUS_TWO'
        | 'PLUS_THREE'
        | 'PLUS_FOUR'
        | 'PLUS_FIVE'
        | 'PLUS_SIX'
        | 'FAMILY';
    notes?: string;
}

export interface UpdateGuestData {
    name?: string;
    email?: string;
    phoneNumber?: string;
    inviteType?:
        | 'GUEST_ONLY'
        | 'PLUS_ONE'
        | 'PLUS_TWO'
        | 'PLUS_THREE'
        | 'PLUS_FOUR'
        | 'PLUS_FIVE'
        | 'PLUS_SIX'
        | 'FAMILY';
    notes?: string;
}

export interface BulkCreateGuestData {
    eventId: string;
    guests: Omit<CreateGuestData, 'eventId'>[];
}

export class GuestRepository extends BaseRepository<
    Guest,
    Prisma.GuestCreateInput,
    Prisma.GuestUpdateInput
> {
    protected modelName = 'guest';

    constructor(prisma: PrismaClient) {
        super(prisma);
    }

    /**
     * Create a new guest
     */
    async createGuest(guestData: CreateGuestData): Promise<Guest> {
        try {
            const guest = await this.model.create({
                data: {
                    ...guestData,
                    event: {
                        connect: { id: guestData.eventId },
                    },
                },
            });

            return guest;
        } catch (error) {
            this.handleError(error, 'createGuest');
        }
    }

    /**
     * Bulk create guests for an event (optimized for importing from contacts)
     */
    async bulkCreateGuests(data: BulkCreateGuestData): Promise<number> {
        try {
            const result = await this.model.createMany({
                data: data.guests.map(guest => ({
                    eventId: data.eventId,
                    ...guest,
                })),
                skipDuplicates: true,
            });

            return result.count;
        } catch (error) {
            this.handleError(error, 'bulkCreateGuests');
        }
    }

    /**
     * Find all guests for an event
     */
    async findByEventId(eventId: string): Promise<Guest[]> {
        try {
            return await this.model.findMany({
                where: { eventId },
                orderBy: {
                    name: 'asc',
                },
            });
        } catch (error) {
            this.handleError(error, 'findByEventId');
        }
    }

    /**
     * Find guest by email for a specific event
     */
    async findByEventAndEmail(
        eventId: string,
        email: string
    ): Promise<Guest | null> {
        try {
            return await this.model.findFirst({
                where: {
                    eventId,
                    email,
                },
            });
        } catch (error) {
            this.handleError(error, 'findByEventAndEmail');
        }
    }

    /**
     * Find guest by phone number for a specific event
     */
    async findByEventAndPhone(
        eventId: string,
        phoneNumber: string
    ): Promise<Guest | null> {
        try {
            return await this.model.findFirst({
                where: {
                    eventId,
                    phoneNumber,
                },
            });
        } catch (error) {
            this.handleError(error, 'findByEventAndPhone');
        }
    }

    /**
     * Update guest information
     */
    async updateGuest(guestId: string, data: UpdateGuestData): Promise<Guest> {
        try {
            return await this.model.update({
                where: { id: guestId },
                data,
            });
        } catch (error) {
            this.handleError(error, 'updateGuest');
        }
    }

    /**
     * Check in a guest
     */
    async checkInGuest(guestId: string): Promise<Guest> {
        try {
            return await this.model.update({
                where: { id: guestId },
                data: {
                    hasCheckedIn: true,
                    checkedInAt: new Date(),
                },
            });
        } catch (error) {
            this.handleError(error, 'checkInGuest');
        }
    }

    /**
     * Undo guest check-in
     */
    async undoCheckIn(guestId: string): Promise<Guest> {
        try {
            return await this.model.update({
                where: { id: guestId },
                data: {
                    hasCheckedIn: false,
                    checkedInAt: null,
                },
            });
        } catch (error) {
            this.handleError(error, 'undoCheckIn');
        }
    }

    /**
     * Get checked-in guests count for an event
     */
    async getCheckedInCount(eventId: string): Promise<number> {
        try {
            return await this.model.count({
                where: {
                    eventId,
                    hasCheckedIn: true,
                },
            });
        } catch (error) {
            this.handleError(error, 'getCheckedInCount');
        }
    }

    /**
     * Get total guests count for an event
     */
    async getTotalGuestsCount(eventId: string): Promise<number> {
        try {
            return await this.model.count({
                where: { eventId },
            });
        } catch (error) {
            this.handleError(error, 'getTotalGuestsCount');
        }
    }

    /**
     * Delete a guest
     */
    async deleteGuest(guestId: string): Promise<void> {
        try {
            await this.model.delete({
                where: { id: guestId },
            });
        } catch (error) {
            this.handleError(error, 'deleteGuest');
        }
    }

    /**
     * Delete all guests for an event
     */
    async deleteByEventId(eventId: string): Promise<number> {
        try {
            const result = await this.model.deleteMany({
                where: { eventId },
            });

            return result.count;
        } catch (error) {
            this.handleError(error, 'deleteByEventId');
        }
    }
}
