import { z } from 'zod';
import { PaginationQuerySchema } from '../common';

/**
 * Event filter types
 */
export const EventFilterSchema = z.enum([
    'upcoming', // Upcoming events I created
    'awaiting', // Events where I'm invited and need to respond
    'accepted', // Events where I accepted the invitation
    'sent', // Invitations I sent (events I created)
    'drafts', // Draft events I created
]);

/**
 * Query parameters for listing events
 */
export const ListEventsQuerySchema = PaginationQuerySchema.extend({
    filter: EventFilterSchema,
    search: z.string().max(255).optional(), // Search by event name
});

/**
 * Event creator/host information
 */
export const EventCreatorSchema = z.object({
    id: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.string(),
});

/**
 * Simplified event list item schema
 */
export const EventListItemSchema = z.object({
    id: z.string(),
    name: z.string(),
    dateTime: z.date(),
    timezone: z.string(), // Venue timezone (IANA format)
    eventImagePath: z.string().nullable(),
    isDraft: z.boolean(),
    createdBy: EventCreatorSchema,
    createdAt: z.date(),
});

/**
 * Pagination metadata schema
 */
export const PaginationMetaSchema = z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
});

/**
 * List events success response schema
 */
export const ListEventsSuccessResponseSchema = z.object({
    success: z.literal(true),
    data: z.array(EventListItemSchema),
    meta: z.object({
        pagination: PaginationMetaSchema,
    }),
});

/**
 * List events error response schema
 */
export const ListEventsErrorResponseSchema = z.object({
    success: z.literal(false),
    error: z.object({
        code: z.string(),
        message: z.string(),
        details: z.unknown().optional(),
    }),
});

/**
 * List events response schema (union of success and error)
 */
export const ListEventsResponseSchema = z.union([
    ListEventsSuccessResponseSchema,
    ListEventsErrorResponseSchema,
]);

// Type exports
export type EventFilter = z.infer<typeof EventFilterSchema>;
export type ListEventsQuery = z.infer<typeof ListEventsQuerySchema>;
export type EventCreator = z.infer<typeof EventCreatorSchema>;
export type EventListItem = z.infer<typeof EventListItemSchema>;
export type PaginationMeta = z.infer<typeof PaginationMetaSchema>;
export type ListEventsSuccessResponse = z.infer<
    typeof ListEventsSuccessResponseSchema
>;
export type ListEventsErrorResponse = z.infer<
    typeof ListEventsErrorResponseSchema
>;
export type ListEventsResponse = z.infer<typeof ListEventsResponseSchema>;

// Helper functions for creating responses
export const createListEventsSuccessResponse = (
    events: EventListItem[],
    pagination: PaginationMeta
): ListEventsSuccessResponse => ({
    success: true,
    data: events,
    meta: {
        pagination,
    },
});

export const createListEventsErrorResponse = (
    code: string,
    message: string,
    details?: unknown
): ListEventsErrorResponse => ({
    success: false,
    error: {
        code,
        message,
        details,
    },
});
