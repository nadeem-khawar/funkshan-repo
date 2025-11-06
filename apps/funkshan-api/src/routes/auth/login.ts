/**
 * Login route
 */
import { FastifyInstance } from 'fastify';
import { AuthController } from '../../controllers/AuthController';
import { AuthService } from '../../services/AuthService';
import { createFastifySchema } from '../../utils/schema';
import {
    LoginRequestSchema,
    LoginSuccessResponseSchema,
    LoginErrorResponseSchema,
} from '@funkshan/api-contracts';

export default async function loginRoute(fastify: FastifyInstance) {
    // Initialize service and controller
    const authService = new AuthService(fastify.prisma);
    const authController = new AuthController(authService);

    // Create schema from Zod schemas - single source of truth
    const schema = createFastifySchema({
        description: 'User login with email and password',
        tags: ['Authentication'],
        body: LoginRequestSchema,
        response: {
            200: LoginSuccessResponseSchema,
            400: LoginErrorResponseSchema,
            401: LoginErrorResponseSchema,
            403: LoginErrorResponseSchema,
            500: LoginErrorResponseSchema,
        },
    });

    fastify.post('/login', {
        schema,
        handler: authController.login.bind(authController),
    });
}
