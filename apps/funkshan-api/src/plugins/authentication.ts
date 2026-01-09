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
    const jwtSecret =
        process.env.JWT_ACCESS_SECRET ||
        'default-access-secret-change-in-production';

    // Debug logging
    fastify.log.info(
        `JWT Plugin initialized with secret length: ${jwtSecret.length}`
    );

    // Register JWT plugin - must use the same secret as token generation
    await fastify.register(jwt, {
        secret: jwtSecret,
        sign: {
            expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
        },
        verify: {
            maxAge: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
        },
    });

    // Add JWT verification decorator
    fastify.decorate(
        'authenticate',
        async function (request: FastifyRequest, reply: FastifyReply) {
            try {
                await request.jwtVerify();
            } catch (err) {
                // Return properly formatted error response
                reply.code(401).send({
                    success: false,
                    error: {
                        code: 'UNAUTHORIZED',
                        message:
                            err instanceof Error
                                ? err.message
                                : 'Authentication required',
                    },
                });
            }
        }
    );
}

export default fp(authenticationPlugin, {
    name: 'authentication',
});
