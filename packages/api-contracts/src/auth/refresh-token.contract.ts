import { z } from 'zod';

/**
 * Refresh token request schema
 */
export const RefreshTokenRequestSchema = z.object({
    refreshToken: z.string().min(1, 'Refresh token is required').trim(),
});

/**
 * Refresh token success response schema
 */
export const RefreshTokenSuccessResponseSchema = z.object({
    success: z.literal(true),
    data: z.object({
        accessToken: z.string(),
        refreshToken: z.string(),
        expiresIn: z.number(), // Token expiration time in seconds
    }),
});

/**
 * Refresh token error response schema
 */
export const RefreshTokenErrorResponseSchema = z.object({
    success: z.literal(false),
    error: z.object({
        code: z.string(),
        message: z.string(),
        details: z.unknown().optional(),
    }),
});

/**
 * Refresh token response schema (union of success and error)
 */
export const RefreshTokenResponseSchema = z.union([
    RefreshTokenSuccessResponseSchema,
    RefreshTokenErrorResponseSchema,
]);

// Type exports
export type RefreshTokenRequest = z.infer<typeof RefreshTokenRequestSchema>;
export type RefreshTokenSuccessResponse = z.infer<
    typeof RefreshTokenSuccessResponseSchema
>;
export type RefreshTokenErrorResponse = z.infer<
    typeof RefreshTokenErrorResponseSchema
>;
export type RefreshTokenResponse = z.infer<typeof RefreshTokenResponseSchema>;

// Helper functions for creating responses
export const createRefreshTokenSuccessResponse = (
    accessToken: string,
    refreshToken: string,
    expiresIn: number
): RefreshTokenSuccessResponse => ({
    success: true,
    data: {
        accessToken,
        refreshToken,
        expiresIn,
    },
});

export const createRefreshTokenErrorResponse = (
    code: string,
    message: string,
    details?: unknown
): RefreshTokenErrorResponse => ({
    success: false,
    error: {
        code,
        message,
        details,
    },
});
