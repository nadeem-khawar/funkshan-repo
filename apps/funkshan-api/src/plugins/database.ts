import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import {
    connect,
    disconnect,
    healthCheck,
    getPrismaClient,
    isConnected,
} from '@funkshan/database';

/**
 * Database plugin that handles PostgreSQL connection using Prisma
 */
async function databasePlugin(
    fastify: FastifyInstance,
    options: FastifyPluginOptions
) {
    const databaseUrl =
        process.env.DATABASE_URL || 'postgresql://localhost:5432/funkshan';
    const isProduction = process.env.NODE_ENV === 'production';

    try {
        // Connect to PostgreSQL using shared package
        fastify.log.info('Connecting to PostgreSQL...');
        await connect({
            datasourceUrl: databaseUrl,
            isProduction,
        });

        // Register Prisma client and utility functions
        fastify.decorate('prisma', getPrismaClient());
        fastify.decorate('isDbConnected', isConnected);
        fastify.decorate('dbHealthCheck', healthCheck);

        // Graceful shutdown
        fastify.addHook('onClose', async () => {
            fastify.log.info('Closing PostgreSQL connection...');
            await disconnect();
        });
    } catch (error) {
        fastify.log.error({ error }, 'Failed to connect to PostgreSQL');
        throw error;
    }
}

// Type extensions for FastifyInstance
declare module 'fastify' {
    interface FastifyInstance {
        prisma: ReturnType<typeof getPrismaClient>;
        isDbConnected: typeof isConnected;
        dbHealthCheck: typeof healthCheck;
    }
}

export default fp(databasePlugin, {
    name: 'database',
    dependencies: ['config'],
});
