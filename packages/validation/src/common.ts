/**
 * Common validation schemas and utilities
 */
import { z } from 'zod';

/**
 * Email validation schema
 */
export const EmailSchema = z.string().email('Invalid email format');

/**
 * Password validation schema
 * Minimum 8 characters, maximum 128 characters
 */
export const PasswordSchema = z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must not exceed 128 characters');

/**
 * MongoDB ObjectId validation schema
 */
export const ObjectIdSchema = z
    .string()
    .regex(/^[a-f\d]{24}$/i, 'Invalid ObjectId format');

/**
 * Pagination schema
 */
export const PaginationSchema = z.object({
    page: z.number().int().positive().default(1),
    limit: z.number().int().positive().max(100).default(10),
});

/**
 * Date range validation schema
 */
export const DateRangeSchema = z.object({
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
});
