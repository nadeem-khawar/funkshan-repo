/**
 * Tenant Repository
 */

import type { PrismaClient, Tenant, Prisma } from '@prisma/client';
import { BaseRepository } from './base';

export class TenantRepository extends BaseRepository<
    Tenant,
    Prisma.TenantCreateInput,
    Prisma.TenantUpdateInput
> {
    protected modelName = 'tenant';

    constructor(prisma: PrismaClient) {
        super(prisma);
    }

    /**
     * Find tenant by slug
     */
    async findBySlug(slug: string): Promise<Tenant | null> {
        return this.findUnique({ slug });
    }

    /**
     * Check if slug is already taken
     */
    async isSlugTaken(slug: string): Promise<boolean> {
        return this.exists({ slug });
    }

    /**
     * Find active tenants
     */
    async findActive(): Promise<Tenant[]> {
        return this.findMany({
            isActive: true,
            isBlocked: false,
        });
    }

    /**
     * Block a tenant
     */
    async block(id: string): Promise<Tenant> {
        return this.update(id, { isBlocked: true });
    }

    /**
     * Unblock a tenant
     */
    async unblock(id: string): Promise<Tenant> {
        return this.update(id, { isBlocked: false });
    }

    /**
     * Deactivate a tenant
     */
    async deactivate(id: string): Promise<Tenant> {
        return this.update(id, { isActive: false });
    }

    /**
     * Activate a tenant
     */
    async activate(id: string): Promise<Tenant> {
        return this.update(id, { isActive: true });
    }

    /**
     * Get tenant with user count
     */
    async findByIdWithUserCount(
        id: string
    ): Promise<(Tenant & { _count: { users: number } }) | null> {
        try {
            return await this.model.findUnique({
                where: { id },
                include: {
                    _count: {
                        select: { users: true },
                    },
                },
            });
        } catch (error) {
            this.handleError(error, 'findByIdWithUserCount');
        }
    }
}
