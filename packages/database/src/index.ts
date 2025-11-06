/**
 * Database package
 * Entry point for @funkshan/database package
 */

export * from './connection';
export * from './repositories';

// Re-export Prisma types for convenience
export type {
    PrismaClient,
    Prisma,
    User,
    Tenant,
    UserDevice,
} from '@prisma/client';

// Re-export Prisma enums
export { UserRole } from '@prisma/client';
