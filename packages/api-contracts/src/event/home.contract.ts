import { z } from 'zod';
import {
    EventListItemSchema,
    PaginationMetaSchema,
} from './list-events.contract';

/**
 * Query parameters for home endpoint
 */
export const HomeEventsQuerySchema = z.object({
    limit: z.coerce.number().int().positive().max(20).default(10), // Limit for all lists
});

/**
 * Paginated list section schema
 */
export const PaginatedListSchema = z.object({
    items: z.array(EventListItemSchema),
    pagination: PaginationMetaSchema,
});

/**
 * Home events data schema
 */
export const HomeEventsDataSchema = z.object({
    upcoming: z.array(EventListItemSchema), // Not paginated, limited list
    awaiting: PaginatedListSchema, // Invites pending response
    accepted: PaginatedListSchema, // Accepted invitations
    sent: PaginatedListSchema, // Invitations I sent (events I created)
    drafts: PaginatedListSchema, // My draft events
});

/**
 * Home events success response schema
 */
export const HomeEventsSuccessResponseSchema = z.object({
    success: z.literal(true),
    data: HomeEventsDataSchema,
});

/**
 * Home events error response schema
 */
export const HomeEventsErrorResponseSchema = z.object({
    success: z.literal(false),
    error: z.object({
        code: z.string(),
        message: z.string(),
        details: z.unknown().optional(),
    }),
});

/**
 * Home events response schema (union of success and error)
 */
export const HomeEventsResponseSchema = z.union([
    HomeEventsSuccessResponseSchema,
    HomeEventsErrorResponseSchema,
]);

// Type exports
export type HomeEventsQuery = z.infer<typeof HomeEventsQuerySchema>;
export type PaginatedList = z.infer<typeof PaginatedListSchema>;
export type HomeEventsData = z.infer<typeof HomeEventsDataSchema>;
export type HomeEventsSuccessResponse = z.infer<
    typeof HomeEventsSuccessResponseSchema
>;
export type HomeEventsErrorResponse = z.infer<
    typeof HomeEventsErrorResponseSchema
>;
export type HomeEventsResponse = z.infer<typeof HomeEventsResponseSchema>;

// Helper function for creating success response
export const createHomeEventsSuccessResponse = (
    data: HomeEventsData
): HomeEventsSuccessResponse => ({
    success: true,
    data,
});

export const createHomeEventsErrorResponse = (
    code: string,
    message: string,
    details?: unknown
): HomeEventsErrorResponse => ({
    success: false,
    error: {
        code,
        message,
        details,
    },
});
