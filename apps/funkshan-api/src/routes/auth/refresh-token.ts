/**
 * Refresh token route
 */
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { AuthController } from '../../controllers/AuthController';
import { createFastifySchema } from '../../utils/schema';
import {
    RefreshTokenRequestSchema,
    RefreshTokenSuccessResponseSchema,
    RefreshTokenErrorResponseSchema,
} from '@funkshan/api-contracts';

interface RouteOptions extends FastifyPluginOptions {
    authController: AuthController;
}

export default async function refreshTokenRoute(
    fastify: FastifyInstance,
    options: RouteOptions
) {
    const { authController } = options;

    // Create schema from Zod schemas - single source of truth
    const schema = createFastifySchema({
        description: 'Refresh access token using refresh token',
        tags: ['Authentication'],
        body: RefreshTokenRequestSchema,
        response: {
            200: RefreshTokenSuccessResponseSchema,
            400: RefreshTokenErrorResponseSchema,
            401: RefreshTokenErrorResponseSchema,
            500: RefreshTokenErrorResponseSchema,
        },
    });

    fastify.post('/refresh-token', {
        schema,
        handler: authController.refreshToken.bind(authController),
    });
}
