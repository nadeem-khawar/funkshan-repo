import { FastifyInstance, FastifyPluginOptions } from 'fastify';

export default async function healthRoutes(
    fastify: FastifyInstance,
    options: FastifyPluginOptions
) {
    // Health check endpoint
    fastify.get('/', {
        schema: {
            description: 'Health check endpoint',
            tags: ['Health'],
            response: {
                200: {
                    type: 'object',
                    properties: {
                        status: { type: 'string' },
                        timestamp: { type: 'string' },
                        uptime: { type: 'number' },
                    },
                },
            },
        },
        handler: async (request, reply) => {
            return {
                status: 'healthy',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
            };
        },
    });

    // Readiness check endpoint
    fastify.get('/ready', {
        schema: {
            description: 'Readiness check endpoint',
            tags: ['Health'],
            response: {
                200: {
                    type: 'object',
                    properties: {
                        status: { type: 'string' },
                        ready: { type: 'boolean' },
                        services: {
                            type: 'object',
                            properties: {
                                database: {
                                    type: 'object',
                                    properties: {
                                        status: { type: 'string' },
                                        readyState: { type: 'number' },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        handler: async (request, reply) => {
            // Check database health
            const dbHealth = await fastify.dbHealthCheck();
            const isReady = dbHealth.status === 'healthy';

            return {
                status: isReady ? 'ready' : 'not ready',
                ready: isReady,
                services: {
                    database: dbHealth,
                },
            };
        },
    });

    // Database health check endpoint
    fastify.get('/db', {
        schema: {
            description: 'Database health check endpoint',
            tags: ['Health'],
            response: {
                200: {
                    type: 'object',
                    properties: {
                        status: { type: 'string' },
                        readyState: { type: 'number' },
                        name: { type: 'string' },
                        host: { type: 'string' },
                        port: { type: 'number' },
                    },
                },
                503: {
                    type: 'object',
                    properties: {
                        status: { type: 'string' },
                        readyState: { type: 'number' },
                        error: { type: 'string' },
                    },
                },
            },
        },
        handler: async (request, reply) => {
            const dbHealth = await fastify.dbHealthCheck();
            if (dbHealth.status !== 'healthy') {
                reply.status(503);
            }
            return dbHealth;
        },
    });
}
