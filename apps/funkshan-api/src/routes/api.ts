import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import authRoutes from './auth';
import eventRoutes from './events';

export default async function apiRoutes(
    fastify: FastifyInstance,
    options: FastifyPluginOptions
) {
    // Register auth routes
    await fastify.register(authRoutes, { prefix: '/auth' });

    // Register event routes
    await fastify.register(eventRoutes, { prefix: '/events' });

    // Example GET endpoint
    fastify.get('/', {
        schema: {
            description: 'Get API information',
            tags: ['API'],
            response: {
                200: {
                    type: 'object',
                    properties: {
                        name: { type: 'string' },
                        version: { type: 'string' },
                        description: { type: 'string' },
                    },
                },
            },
        },
        handler: async (request, reply) => {
            return {
                name: 'Funkshan API',
                version: '1.0.0',
                description: 'RESTful API built with Fastify and TypeScript',
            };
        },
    });

    // Example POST endpoint
    fastify.post('/echo', {
        schema: {
            description: 'Echo endpoint for testing',
            tags: ['API'],
            body: {
                type: 'object',
                properties: {
                    message: { type: 'string' },
                },
                required: ['message'],
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        echo: { type: 'string' },
                        timestamp: { type: 'string' },
                    },
                },
            },
        },
        handler: async (request, reply) => {
            const { message } = request.body as { message: string };
            return {
                echo: message,
                timestamp: new Date().toISOString(),
            };
        },
    });
}
