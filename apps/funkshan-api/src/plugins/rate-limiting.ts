import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import rateLimit from '@fastify/rate-limit';
import throttle from '@fastify/throttle';

/**
 * Rate limiting and throttling plugin
 */
async function rateLimitingPlugin(
    fastify: FastifyInstance,
    options: FastifyPluginOptions
) {
    // Register rate limiting
    await fastify.register(rateLimit, {
        max: process.env.NODE_ENV === 'development' ? 1000 : 100,
        timeWindow: '1 minute',
        skipOnError: true,
        keyGenerator: request => {
            const forwarded = request.headers['x-forwarded-for'];
            const ip =
                request.ip ||
                (Array.isArray(forwarded) ? forwarded[0] : forwarded) ||
                'anonymous';
            return ip;
        },
        errorResponseBuilder: (request, context) => {
            return {
                code: 429,
                error: 'Rate Limit Exceeded',
                message: `Rate limit exceeded, retry in ${context.ttl} seconds`,
                expiresIn: context.ttl,
            };
        },
    });

    // Register throttling for connection limits
    await fastify.register(throttle, {
        bytesPerSecond: 1000000, // 1MB/s
        streamPayloads: true,
    });
}

export default fp(rateLimitingPlugin, {
    name: 'rate-limiting',
});
