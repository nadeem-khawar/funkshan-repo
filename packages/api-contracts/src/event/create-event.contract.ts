import { z } from 'zod';

/**
 * Enums matching the database schema
 */
export const InviteTypeSchema = z.enum([
    'GUEST_ONLY',
    'PLUS_ONE',
    'PLUS_TWO',
    'PLUS_THREE',
    'PLUS_FOUR',
    'PLUS_FIVE',
    'PLUS_SIX',
    'FAMILY',
]);

export const InviteStatusSchema = z.enum([
    'PENDING',
    'SENT',
    'ACCEPTED',
    'REJECTED',
    'MAYBE',
    'CANCELLED',
]);

export const EntryMechanismSchema = z.enum(['QR_CODE', 'PIN_CODE', 'BOTH']);

/**
 * Venue information schema (embedded object)
 */
export const VenueSchema = z.object({
    address: z.string().min(1, 'Venue address is required').max(500),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    timezone: z.string().min(1, 'Venue timezone is required').max(50), // IANA timezone
    locationImagePath: z.string().max(500).optional(),
    mapImagePath: z.string().max(500).optional(),
});

/**
 * Guest creation schema (nested within event)
 */
export const CreateGuestSchema = z.object({
    name: z.string().min(1, 'Guest name is required').max(255),
    email: z.string().email('Invalid email address').max(254).optional(),
    phoneNumber: z
        .string()
        .max(20)
        .regex(/^[\d\s+()-]+$/, 'Invalid phone number format')
        .optional(),
    inviteType: InviteTypeSchema.default('GUEST_ONLY'),
    notes: z.string().max(1000).optional(),
});

/**
 * Checkin agent schema (user IDs who can check in guests)
 */
export const CreateCheckinAgentSchema = z.object({
    userId: z.string().min(1, 'User ID is required'),
});

/**
 * Create event request schema
 */
export const CreateEventRequestSchema = z.object({
    // Basic event information
    name: z.string().min(1, 'Event name is required').max(255),
    dateTime: z.coerce.date(),
    details: z.string().max(5000).optional(),

    // Images (paths will be handled by file upload separately)
    eventImagePath: z.string().max(500).optional(),
    backgroundImagePath: z.string().max(500).optional(),

    // Venue information (embedded object)
    venue: VenueSchema,

    // Entry mechanism (QR code and PIN code will be generated on server)
    entryMechanism: EntryMechanismSchema.optional(),

    // Optional fields
    dressCode: z.string().max(255).optional(),
    giftSuggestions: z.string().max(2000).optional(),

    // Event status
    isDraft: z.boolean().default(true),

    // Guests (optional, can be added later)
    guests: z.array(CreateGuestSchema).default([]),

    // Checkin agents (optional, users who can check in guests)
    checkinAgents: z.array(CreateCheckinAgentSchema).default([]),
});

/**
 * Venue response schema
 */
export const VenueResponseSchema = z.object({
    address: z.string(),
    latitude: z.number().nullable(),
    longitude: z.number().nullable(),
    timezone: z.string(),
    locationImagePath: z.string().nullable(),
    mapImagePath: z.string().nullable(),
});

/**
 * Event response schema (what gets returned)
 */
export const EventResponseSchema = z.object({
    id: z.string(),
    userId: z.string(),
    name: z.string(),
    dateTime: z.date(),
    details: z.string().nullable(),
    eventImagePath: z.string().nullable(),
    backgroundImagePath: z.string().nullable(),
    venue: VenueResponseSchema,
    entryMechanism: EntryMechanismSchema.nullable(),
    qrCode: z.string().nullable(),
    pinCode: z.string().nullable(),
    dressCode: z.string().nullable(),
    giftSuggestions: z.string().nullable(),
    isDraft: z.boolean(),
    publishedAt: z.date().nullable(),
    isActive: z.boolean(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

/**
 * Checkin agent response schema
 */
export const CheckinAgentResponseSchema = z.object({
    id: z.string(),
    eventId: z.string(),
    userId: z.string(),
    assignedAt: z.date(),
});

/**
 * Guest response schema
 */
export const GuestResponseSchema = z.object({
    id: z.string(),
    eventId: z.string(),
    name: z.string(),
    email: z.string().nullable(),
    phoneNumber: z.string().nullable(),
    inviteType: InviteTypeSchema,
    inviteStatus: InviteStatusSchema,
    inviteSentAt: z.date().nullable(),
    inviteRespondedAt: z.date().nullable(),
    hasCheckedIn: z.boolean(),
    checkedInAt: z.date().nullable(),
    notes: z.string().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

/**
 * Event with guests and checkin agents response schema
 */
export const EventWithGuestsResponseSchema = EventResponseSchema.extend({
    guests: z.array(GuestResponseSchema),
    checkinAgents: z.array(CheckinAgentResponseSchema),
});

/**
 * Create event success response schema
 */
export const CreateEventSuccessResponseSchema = z.object({
    success: z.literal(true),
    data: EventWithGuestsResponseSchema,
});

/**
 * Create event error response schema
 */
export const CreateEventErrorResponseSchema = z.object({
    success: z.literal(false),
    error: z.object({
        code: z.string(),
        message: z.string(),
        details: z.unknown().optional(),
    }),
});

/**
 * Create event response schema (union of success and error)
 */
export const CreateEventResponseSchema = z.union([
    CreateEventSuccessResponseSchema,
    CreateEventErrorResponseSchema,
]);

// Type exports
export type InviteType = z.infer<typeof InviteTypeSchema>;
export type InviteStatus = z.infer<typeof InviteStatusSchema>;
export type EntryMechanism = z.infer<typeof EntryMechanismSchema>;
export type Venue = z.infer<typeof VenueSchema>;
export type VenueResponse = z.infer<typeof VenueResponseSchema>;
export type CreateGuest = z.infer<typeof CreateGuestSchema>;
export type CreateCheckinAgent = z.infer<typeof CreateCheckinAgentSchema>;
export type CheckinAgentResponse = z.infer<typeof CheckinAgentResponseSchema>;
export type CreateEventRequest = z.infer<typeof CreateEventRequestSchema>;
export type EventResponse = z.infer<typeof EventResponseSchema>;
export type GuestResponse = z.infer<typeof GuestResponseSchema>;
export type EventWithGuestsResponse = z.infer<
    typeof EventWithGuestsResponseSchema
>;
export type CreateEventSuccessResponse = z.infer<
    typeof CreateEventSuccessResponseSchema
>;
export type CreateEventErrorResponse = z.infer<
    typeof CreateEventErrorResponseSchema
>;
export type CreateEventResponse = z.infer<typeof CreateEventResponseSchema>;

// Helper functions for creating responses
export const createEventSuccessResponse = (
    event: EventWithGuestsResponse
): CreateEventSuccessResponse => ({
    success: true,
    data: event,
});

export const createEventErrorResponse = (
    code: string,
    message: string,
    details?: unknown
): CreateEventErrorResponse => ({
    success: false,
    error: {
        code,
        message,
        details,
    },
});
