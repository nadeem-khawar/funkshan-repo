/**
 * Register user route
 */
import { FastifyInstance } from 'fastify';
import { UserController } from '../../controllers/UserController';
import { UserService } from '../../services/UserService';
import { createFastifySchema } from '../../utils/schema';
import {
    CreateUserRequestSchema,
    CreateUserResponseSchema,
} from '@funkshan/api-contracts';

export default async function registerRoute(fastify: FastifyInstance) {
    // Initialize service and controller
    const userService = new UserService(fastify.prisma);
    const userController = new UserController(userService);

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
