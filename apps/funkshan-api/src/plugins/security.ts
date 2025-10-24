import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import sensible from '@fastify/sensible';

/**
 * Security plugin that registers security-related middleware
 */
async function securityPlugin(
    fastify: FastifyInstance,
    options: FastifyPluginOptions
) {
    // Register helmet for security headers
    await fastify.register(helmet, {
        contentSecurityPolicy: process.env.NODE_ENV === 'production',
        crossOriginEmbedderPolicy: process.env.NODE_ENV === 'production',
    });

    // Register CORS
    await fastify.register(cors, {
        origin:
            process.env.NODE_ENV === 'development'
                ? true
                : ['http://localhost:3000'],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    });

    // Register sensible plugin for common utilities
    await fastify.register(sensible);
}

export default fp(securityPlugin, {
    name: 'security',
});
