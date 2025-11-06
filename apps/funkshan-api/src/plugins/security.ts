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
        contentSecurityPolicy:
            process.env.NODE_ENV === 'production'
                ? {
                      directives: {
                          defaultSrc: ["'self'"],
                          styleSrc: ["'self'", "'unsafe-inline'"],
                          scriptSrc: ["'self'", "'unsafe-inline'"],
                          imgSrc: ["'self'", 'data:', 'https:'],
                      },
                  }
                : false, // Disable CSP in development for Swagger UI compatibility
        crossOriginEmbedderPolicy: false, // Disable for Swagger UI compatibility
        global: true,
    });

    // Register CORS
    await fastify.register(cors, {
        origin:
            process.env.NODE_ENV === 'development'
                ? true
                : ['http://localhost:3000', 'http://localhost:3001'],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
        exposedHeaders: ['Content-Range', 'X-Content-Range'],
        preflightContinue: false,
        optionsSuccessStatus: 204,
    });

    // Register sensible plugin for common utilities
    await fastify.register(sensible);
}

export default fp(securityPlugin, {
    name: 'security',
});
