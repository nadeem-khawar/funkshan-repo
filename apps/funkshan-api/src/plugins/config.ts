import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import env from '@fastify/env';

/**
 * Environment configuration plugin that validates and loads environment variables
 */
async function configPlugin(
    fastify: FastifyInstance,
    options: FastifyPluginOptions
) {
    const schema = {
        type: 'object',
        properties: {
            NODE_ENV: {
                type: 'string',
                default: 'development',
            },
            PORT: {
                type: 'integer',
                default: 3001,
            },
            HOST: {
                type: 'string',
                default: '0.0.0.0',
            },
            LOG_LEVEL: {
                type: 'string',
                default: 'info',
            },
            JWT_SECRET: {
                type: 'string',
                default: 'your-secret-key-change-in-production',
            },
            CORS_ORIGINS: {
                type: 'string',
                default: 'http://localhost:3000',
            },
            MONGODB_URL: {
                type: 'string',
                default: 'mongodb://localhost:27017/funkshan',
            },
        },
    };

    await fastify.register(env, {
        schema,
        dotenv: true,
        data: process.env,
    });
}

export default fp(configPlugin, {
    name: 'config',
});
