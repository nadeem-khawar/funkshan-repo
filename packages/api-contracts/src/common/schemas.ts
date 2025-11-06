/**
 * Common API response schemas
 */
import { z } from 'zod';

export const ApiResponseSchema = z.object({
    success: z.boolean(),
    data: z.any().optional(),
    error: z
        .object({
            message: z.string(),
            code: z.string().optional(),
            details: z.any().optional(),
        })
        .optional(),
    meta: z
        .object({
            pagination: z
                .object({
                    page: z.number(),
                    limit: z.number(),
                    total: z.number(),
                    totalPages: z.number(),
                })
                .optional(),
            timestamp: z.date().optional(),
        })
        .optional(),
});

export const PaginationQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
});

export type ApiResponse<T = any> = {
    success: boolean;
    data?: T;
    error?: {
        message: string;
        code?: string;
        details?: any;
    };
    meta?: {
        pagination?: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
        timestamp?: Date;
    };
};

export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;
