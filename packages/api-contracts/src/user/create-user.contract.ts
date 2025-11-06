/**
 * User API contracts and schemas
 */
import { z } from 'zod';

/**
 * Create User Request Schema
 */
export const CreateUserRequestSchema = z.object({
    firstName: z
        .string()
        .min(2, 'First name must be at least 2 characters')
        .max(50, 'First name must not exceed 50 characters')
        .trim(),
    lastName: z
        .string()
        .min(2, 'Last name must be at least 2 characters')
        .max(50, 'Last name must not exceed 50 characters')
        .trim(),
    email: z.string().email('Invalid email format').toLowerCase().trim(),
    phoneNumber: z
        .string()
        .regex(
            /^\+\d{1,4}\d{6,14}$/,
            'Phone number must be in format: +[country code][mobile number]'
        )
        .trim()
        .optional(),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .max(128, 'Password must not exceed 128 characters'),
    deviceId: z
        .string()
        .min(1, 'Device ID is required')
        .max(255, 'Device ID must not exceed 255 characters')
        .trim(),
    deviceType: z
        .enum(['ios', 'android', 'web'], {
            errorMap: () => ({
                message: 'Device type must be one of: ios, android, web',
            }),
        })
        .optional(),
    deviceName: z
        .string()
        .max(100, 'Device name must not exceed 100 characters')
        .trim()
        .optional(),
    pushToken: z
        .string()
        .max(500, 'Push token must not exceed 500 characters')
        .trim()
        .optional(),
});

/**
 * Create User Response Schema
 */
export const CreateUserResponseSchema = z.object({
    success: z.boolean(),
    data: z
        .object({
            id: z.string(),
            firstName: z.string(),
            lastName: z.string(),
            email: z.string(),
            phoneNumber: z.string().optional(),
            isEmailVerified: z.boolean(),
            createdAt: z.date(),
        })
        .optional(),
    error: z
        .object({
            message: z.string(),
            code: z.string().optional(),
            details: z.any().optional(),
        })
        .optional(),
});

/**
 * TypeScript types inferred from schemas
 */
export type CreateUserRequest = z.infer<typeof CreateUserRequestSchema>;
export type CreateUserResponse = z.infer<typeof CreateUserResponseSchema>;

/**
 * Success response helper
 */
export const createUserSuccessResponse = (user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string | null;
    isEmailVerified: boolean;
    createdAt: Date;
}): CreateUserResponse => ({
    success: true,
    data: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber ?? undefined,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt,
    },
});

/**
 * Error response helper
 */
export const createUserErrorResponse = (
    message: string,
    code?: string,
    details?: any
): CreateUserResponse => ({
    success: false,
    error: {
        message,
        code,
        details,
    },
});
