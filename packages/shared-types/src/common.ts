/**
 * Common types and interfaces used across the application
 */

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: {
        message: string;
        code?: string;
        details?: any;
    };
    meta?: {
        pagination?: PaginationMeta;
        timestamp?: Date;
    };
}

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface PaginationOptions {
    page?: number;
    limit?: number;
    skip?: number;
}

export type UserRole = 'admin' | 'user' | 'superadmin';

export type Timestamp = {
    createdAt: Date;
    updatedAt: Date;
};
