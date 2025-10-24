import fp from 'fastify-plugin';
import {
    FastifyInstance,
    FastifyPluginOptions,
    FastifyRequest,
    FastifyReply,
} from 'fastify';
import jwt from '@fastify/jwt';

/**
 * Authentication plugin that handles JWT authentication
 */
async function authenticationPlugin(
    fastify: FastifyInstance,
    options: FastifyPluginOptions
) {
    // Register JWT plugin
    await fastify.register(jwt, {
        secret:
            process.env.JWT_SECRET || 'your-secret-key-change-in-production',
        sign: {
            expiresIn: '24h',
        },
        verify: {
            maxAge: '24h',
        },
    });

    // Add JWT verification decorator
    fastify.decorate(
        'authenticate',
        async function (request: FastifyRequest, reply: FastifyReply) {
            try {
                await request.jwtVerify();
            } catch (err) {
                reply.send(err);
            }
        }
    );
}

export default fp(authenticationPlugin, {
    name: 'authentication',
});
