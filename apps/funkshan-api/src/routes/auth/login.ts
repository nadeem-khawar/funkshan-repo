/**
 * Login route
 */
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { AuthController } from '../../controllers/AuthController';
import { createFastifySchema } from '../../utils/schema';
import {
    LoginRequestSchema,
    LoginSuccessResponseSchema,
    LoginErrorResponseSchema,
} from '@funkshan/api-contracts';

interface RouteOptions extends FastifyPluginOptions {
    authController: AuthController;
}

export default async function loginRoute(
    fastify: FastifyInstance,
    options: RouteOptions
) {
    const { authController } = options;

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
