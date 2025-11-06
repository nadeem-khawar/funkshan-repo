import { z } from 'zod';

/**
 * Login request schema
 */
export const LoginRequestSchema = z.object({
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Please provide a valid email address')
        .max(254, 'Email is too long')
        .toLowerCase()
        .trim(),
    password: z
        .string()
        .min(1, 'Password is required')
        .min(6, 'Password must be at least 6 characters long')
        .max(128, 'Password is too long'),
});

/**
 * User profile schema (for response)
 */
export const UserProfileSchema = z.object({
    id: z.string(),
    email: z.string().email(),
    firstName: z.string(),
    lastName: z.string(),
    phoneNumber: z.string().nullable(),
    role: z.enum(['USER', 'ADMIN', 'SUPER_ADMIN']),
    isEmailVerified: z.boolean(),
    tenantId: z.string().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

/**
 * Login success response schema
 */
export const LoginSuccessResponseSchema = z.object({
    success: z.literal(true),
    data: z.object({
        user: UserProfileSchema,
        accessToken: z.string(),
        refreshToken: z.string(),
        expiresIn: z.number(), // Token expiration time in seconds
    }),
});

/**
 * Login error response schema
 */
export const LoginErrorResponseSchema = z.object({
    success: z.literal(false),
    error: z.object({
        code: z.string(),
        message: z.string(),
        details: z.unknown().optional(),
    }),
});

/**
 * Login response schema (union of success and error)
 */
export const LoginResponseSchema = z.union([
    LoginSuccessResponseSchema,
    LoginErrorResponseSchema,
]);

// Type exports
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type UserProfile = z.infer<typeof UserProfileSchema>;
export type LoginSuccessResponse = z.infer<typeof LoginSuccessResponseSchema>;
export type LoginErrorResponse = z.infer<typeof LoginErrorResponseSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;

// Helper functions for creating responses
export const createLoginSuccessResponse = (
    user: UserProfile,
    accessToken: string,
    refreshToken: string,
    expiresIn: number
): LoginSuccessResponse => ({
    success: true,
    data: {
        user,
        accessToken,
        refreshToken,
        expiresIn,
    },
});

export const createLoginErrorResponse = (
    code: string,
    message: string,
    details?: unknown
): LoginErrorResponse => ({
    success: false,
    error: {
        code,
        message,
        details,
    },
});
