/**
 * Register user route
 */
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { UserController } from '../../controllers/UserController';
import { createFastifySchema } from '../../utils/schema';
import {
    CreateUserRequestSchema,
    CreateUserResponseSchema,
} from '@funkshan/api-contracts';

interface RouteOptions extends FastifyPluginOptions {
    userController: UserController;
}

export default async function registerRoute(
    fastify: FastifyInstance,
    options: RouteOptions
) {
    const { userController } = options;

    // Create schema from Zod schemas - single source of truth
    const schema = createFastifySchema({
        description: 'Register a new user',
        tags: ['Authentication'],
        body: CreateUserRequestSchema,
        response: {
            201: CreateUserResponseSchema,
            400: CreateUserResponseSchema,
            409: CreateUserResponseSchema,
            500: CreateUserResponseSchema,
        },
    });

    fastify.post('/register', {
        schema,
        handler: userController.registerUser.bind(userController),
    });
}
