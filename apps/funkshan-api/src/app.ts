import { FastifyInstance } from 'fastify';

// Import plugins
import * as plugins from './plugins';

// Import routes
import healthRoutes from './routes/health';
import apiRoutes from './routes/api';

export async function createServer(fastify: FastifyInstance) {
    // Register core plugins in order
    await fastify.register(plugins.config);
    await fastify.register(plugins.database);
    await fastify.register(plugins.security);
    await fastify.register(plugins.rateLimiting);
    await fastify.register(plugins.documentation);
    await fastify.register(plugins.authentication);

    // Register routes
    await fastify.register(healthRoutes, { prefix: '/health' });
    await fastify.register(apiRoutes, { prefix: '/api/v1' });

    // Global error handler
    fastify.setErrorHandler((error, request, reply) => {
        fastify.log.error(error);

        if (error.validation) {
            reply.status(400).send({
                error: 'Validation Error',
                message: error.message,
                details: error.validation,
            });
            return;
        }

        reply.status(error.statusCode || 500).send({
            error: error.name || 'Internal Server Error',
            message: error.message || 'Something went wrong',
        });
    });

    // Not found handler
    fastify.setNotFoundHandler((request, reply) => {
        reply.status(404).send({
            error: 'Not Found',
            message: `Route ${request.method} ${request.url} not found`,
        });
    });

    return fastify;
}
