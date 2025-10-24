import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

/**
 * API documentation plugin using Swagger/OpenAPI
 */
async function documentationPlugin(
    fastify: FastifyInstance,
    options: FastifyPluginOptions
) {
    // Register Swagger for OpenAPI specification generation
    await fastify.register(swagger, {
        openapi: {
            openapi: '3.0.0',
            info: {
                title: 'Funkshan API',
                description:
                    'RESTful API for Funkshan application built with Fastify and TypeScript',
                version: '1.0.0',
                contact: {
                    name: 'API Support',
                    email: 'support@funkshan.com',
                },
                license: {
                    name: 'ISC',
                },
            },
            servers: [
                {
                    url:
                        process.env.NODE_ENV === 'development'
                            ? 'http://localhost:3001'
                            : 'https://api.funkshan.com',
                    description:
                        process.env.NODE_ENV === 'development'
                            ? 'Development server'
                            : 'Production server',
                },
            ],
            components: {
                securitySchemes: {
                    bearerAuth: {
                        type: 'http',
                        scheme: 'bearer',
                        bearerFormat: 'JWT',
                    },
                },
            },
            tags: [
                { name: 'Health', description: 'Health check endpoints' },
                { name: 'API', description: 'General API endpoints' },
                { name: 'Auth', description: 'Authentication endpoints' },
            ],
        },
        hideUntagged: true,
    });

    // Register Swagger UI for interactive documentation
    await fastify.register(swaggerUi, {
        routePrefix: '/docs',
        uiConfig: {
            docExpansion: 'list',
            deepLinking: true,
            defaultModelsExpandDepth: 1,
            defaultModelExpandDepth: 1,
        },
        uiHooks: {
            onRequest: function (request, reply, done) {
                // Add custom headers or logic if needed
                done();
            },
        },
        staticCSP: true,
        transformStaticCSP: (header: string) => header,
        transformSpecification: (swaggerObject, request, reply) => {
            return swaggerObject;
        },
    });
}

export default fp(documentationPlugin, {
    name: 'documentation',
});
