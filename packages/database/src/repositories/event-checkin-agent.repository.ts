/**
 * Event Checkin Agent Repository
 */

import type { PrismaClient, EventCheckinAgent, Prisma } from '@prisma/client';
import { BaseRepository } from './base';

export interface AssignCheckinAgentData {
    eventId: string;
    userId: string;
}

export class EventCheckinAgentRepository extends BaseRepository<
    EventCheckinAgent,
    Prisma.EventCheckinAgentCreateInput,
    Prisma.EventCheckinAgentUpdateInput
> {
    protected modelName = 'eventCheckinAgent';

    constructor(prisma: PrismaClient) {
        super(prisma);
    }

    /**
     * Assign a checkin agent to an event
     */
    async assignAgent(
        data: AssignCheckinAgentData
    ): Promise<EventCheckinAgent> {
        try {
            // Check if already assigned
            const existing = await this.model.findUnique({
                where: {
                    eventId_userId: {
                        eventId: data.eventId,
                        userId: data.userId,
                    },
                },
            });

            if (existing) {
                return existing;
            }

            return await this.model.create({
                data: {
                    event: {
                        connect: { id: data.eventId },
                    },
                    user: {
                        connect: { id: data.userId },
                    },
                },
            });
        } catch (error) {
            this.handleError(error, 'assignAgent');
        }
    }

    /**
     * Bulk assign multiple checkin agents to an event
     */
    async bulkAssignAgents(
        eventId: string,
        userIds: string[]
    ): Promise<number> {
        try {
            const result = await this.model.createMany({
                data: userIds.map(userId => ({
                    eventId,
                    userId,
                })),
                skipDuplicates: true,
            });

            return result.count;
        } catch (error) {
            this.handleError(error, 'bulkAssignAgents');
        }
    }

    /**
     * Remove a checkin agent from an event
     */
    async removeAgent(eventId: string, userId: string): Promise<void> {
        try {
            await this.model.delete({
                where: {
                    eventId_userId: {
                        eventId,
                        userId,
                    },
                },
            });
        } catch (error) {
            this.handleError(error, 'removeAgent');
        }
    }

    /**
     * Find all checkin agents for an event
     */
    async findByEventId(eventId: string): Promise<any[]> {
        try {
            return await this.model.findMany({
                where: { eventId },
                include: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            phoneNumber: true,
                            role: true,
                        },
                    },
                },
            });
        } catch (error) {
            this.handleError(error, 'findByEventId');
        }
    }

    /**
     * Find all events where a user is a checkin agent
     */
    async findEventsByUserId(userId: string): Promise<any[]> {
        try {
            return await this.model.findMany({
                where: { userId },
                include: {
                    event: true,
                },
                orderBy: {
                    event: {
                        dateTime: 'desc',
                    },
                },
            });
        } catch (error) {
            this.handleError(error, 'findEventsByUserId');
        }
    }

    /**
     * Check if a user is a checkin agent for an event
     */
    async isAgentForEvent(eventId: string, userId: string): Promise<boolean> {
        try {
            const agent = await this.model.findUnique({
                where: {
                    eventId_userId: {
                        eventId,
                        userId,
                    },
                },
            });

            return !!agent;
        } catch (error) {
            this.handleError(error, 'isAgentForEvent');
        }
    }

    /**
     * Remove all checkin agents for an event
     */
    async removeAllAgents(eventId: string): Promise<number> {
        try {
            const result = await this.model.deleteMany({
                where: { eventId },
            });

            return result.count;
        } catch (error) {
            this.handleError(error, 'removeAllAgents');
        }
    }
}
