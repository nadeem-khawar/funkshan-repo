/**
 * Refresh token route
 */
import { FastifyInstance } from 'fastify';
import { AuthController } from '../../controllers/AuthController';
import { AuthService } from '../../services/AuthService';
import { createFastifySchema } from '../../utils/schema';
import {
    RefreshTokenRequestSchema,
    RefreshTokenSuccessResponseSchema,
    RefreshTokenErrorResponseSchema,
} from '@funkshan/api-contracts';

export default async function refreshTokenRoute(fastify: FastifyInstance) {
    // Initialize service and controller
    const authService = new AuthService(fastify.prisma);
    const authController = new AuthController(authService);

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
