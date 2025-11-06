/**
 * Fastify type extensions
 */
import { PrismaClient } from '@prisma/client';

declare module 'fastify' {
    interface FastifyInstance {
        prisma: PrismaClient;
        isDbConnected: () => boolean;
        dbHealthCheck: () => Promise<{ status: string; error?: string }>;
    }
}
