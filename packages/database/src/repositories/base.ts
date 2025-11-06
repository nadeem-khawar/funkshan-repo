/**
 * Base repository for Prisma-based data access
 */

import type { PrismaClient } from '@prisma/client';

export interface PaginationOptions {
    skip?: number;
    take?: number;
    orderBy?: Record<string, 'asc' | 'desc'>;
}

export interface PaginatedResult<T> {
    data: T[];
    total: number;
    skip: number;
    take: number;
}

/**
 * Abstract base repository class with common Prisma operations
 * Provides type-safe CRUD operations for all entities
 */
export abstract class BaseRepository<T, TCreate, TUpdate> {
    protected abstract modelName: string;

    constructor(protected prisma: PrismaClient) {}

    /**
     * Get the Prisma model delegate for this repository
     */
    protected get model(): any {
        return (this.prisma as any)[this.modelName];
    }

    /**
     * Find a single record by ID
     */
    async findById(id: string): Promise<T | null> {
        try {
            return await this.model.findUnique({
                where: { id },
            });
        } catch (error) {
            this.handleError(error, 'findById');
        }
    }

    /**
     * Find a single record by any unique field
     */
    async findUnique(where: Record<string, any>): Promise<T | null> {
        try {
            return await this.model.findUnique({ where });
        } catch (error) {
            this.handleError(error, 'findUnique');
        }
    }

    /**
     * Find first record matching the criteria
     */
    async findFirst(where: Record<string, any>): Promise<T | null> {
        try {
            return await this.model.findFirst({ where });
        } catch (error) {
            this.handleError(error, 'findFirst');
        }
    }

    /**
     * Find all records matching the criteria
     */
    async findMany(
        where?: Record<string, any>,
        options?: PaginationOptions
    ): Promise<T[]> {
        try {
            return await this.model.findMany({
                where,
                skip: options?.skip,
                take: options?.take,
                orderBy: options?.orderBy,
            });
        } catch (error) {
            this.handleError(error, 'findMany');
        }
    }

    /**
     * Find records with pagination
     */
    async findManyPaginated(
        where?: Record<string, any>,
        options?: PaginationOptions
    ): Promise<PaginatedResult<T>> {
        try {
            const [data, total] = await Promise.all([
                this.model.findMany({
                    where,
                    skip: options?.skip,
                    take: options?.take,
                    orderBy: options?.orderBy,
                }),
                this.model.count({ where }),
            ]);

            return {
                data,
                total,
                skip: options?.skip ?? 0,
                take: options?.take ?? data.length,
            };
        } catch (error) {
            this.handleError(error, 'findManyPaginated');
        }
    }

    /**
     * Create a new record
     */
    async create(data: TCreate): Promise<T> {
        try {
            return await this.model.create({ data });
        } catch (error) {
            this.handleError(error, 'create');
        }
    }

    /**
     * Create multiple records
     */
    async createMany(data: TCreate[]): Promise<{ count: number }> {
        try {
            return await this.model.createMany({ data });
        } catch (error) {
            this.handleError(error, 'createMany');
        }
    }

    /**
     * Update a record by ID
     */
    async update(id: string, data: TUpdate): Promise<T> {
        try {
            return await this.model.update({
                where: { id },
                data,
            });
        } catch (error) {
            this.handleError(error, 'update');
        }
    }

    /**
     * Update multiple records
     */
    async updateMany(
        where: Record<string, any>,
        data: TUpdate
    ): Promise<{ count: number }> {
        try {
            return await this.model.updateMany({
                where,
                data,
            });
        } catch (error) {
            this.handleError(error, 'updateMany');
        }
    }

    /**
     * Upsert a record (update if exists, create if not)
     */
    async upsert(
        where: Record<string, any>,
        create: TCreate,
        update: TUpdate
    ): Promise<T> {
        try {
            return await this.model.upsert({
                where,
                create,
                update,
            });
        } catch (error) {
            this.handleError(error, 'upsert');
        }
    }

    /**
     * Delete a record by ID
     */
    async delete(id: string): Promise<T> {
        try {
            return await this.model.delete({
                where: { id },
            });
        } catch (error) {
            this.handleError(error, 'delete');
        }
    }

    /**
     * Delete multiple records
     */
    async deleteMany(where: Record<string, any>): Promise<{ count: number }> {
        try {
            return await this.model.deleteMany({ where });
        } catch (error) {
            this.handleError(error, 'deleteMany');
        }
    }

    /**
     * Count records matching the criteria
     */
    async count(where?: Record<string, any>): Promise<number> {
        try {
            return await this.model.count({ where });
        } catch (error) {
            this.handleError(error, 'count');
        }
    }

    /**
     * Check if a record exists
     */
    async exists(where: Record<string, any>): Promise<boolean> {
        try {
            const count = await this.model.count({ where });
            return count > 0;
        } catch (error) {
            this.handleError(error, 'exists');
        }
    }

    /**
     * Soft delete (set isActive = false)
     * Override this method if your model doesn't have isActive field
     */
    async softDelete(id: string): Promise<T | null> {
        try {
            return await this.model.update({
                where: { id },
                data: { isActive: false },
            });
        } catch (error) {
            // If model doesn't have isActive field, fall back to hard delete
            if (error instanceof Error && error.message.includes('isActive')) {
                console.warn(
                    `Model ${this.modelName} doesn't support soft delete, using hard delete`
                );
                return await this.delete(id);
            }
            this.handleError(error, 'softDelete');
        }
    }

    /**
     * Handle errors consistently
     */
    protected handleError(error: any, operation: string): never {
        console.error(`Error in ${this.modelName}.${operation}:`, error);
        throw error;
    }
}
