/**
 * Fastify type extensions
 */
import { PrismaClient } from '@prisma/client';

declare module 'fastify' {
    interface FastifyInstance {
        prisma: PrismaClient;
        isDbConnected: () => boolean;
        dbHealthCheck: () => Promise<{ status: string; error?: string }>;
        authenticate: (
            request: FastifyRequest,
            reply: FastifyReply
        ) => Promise<void>;
    }

    interface FastifyRequest {
        user: {
            userId: string;
            email: string;
            role: string;
            tenantId: string | null;
        };
    }
}
