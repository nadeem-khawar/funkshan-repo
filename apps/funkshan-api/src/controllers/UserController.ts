/**
 * User Controller - Handles HTTP requests for user operations
 */
import { FastifyRequest, FastifyReply } from 'fastify';
import { UserService } from '../services/UserService';
import {
    CreateUserRequestSchema,
    createUserSuccessResponse,
    createUserErrorResponse,
} from '@funkshan/api-contracts';
import { AppError } from '../utils/errors';

export class UserController {
    constructor(private userService: UserService) {}

    /**
     * Register a new user
     */
    async registerUser(request: FastifyRequest, reply: FastifyReply) {
        try {
            // Validate request body with Zod
            const validatedData = CreateUserRequestSchema.parse(request.body);

            // Register user
            const user = await this.userService.registerUser(validatedData);

            // Return success response
            const response = createUserSuccessResponse({
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phoneNumber: user.phoneNumber,
                isEmailVerified: user.isEmailVerified,
                createdAt: user.createdAt,
            });

            return reply.code(201).send(response);
        } catch (error) {
            // Handle Zod validation errors
            if (error instanceof Error && error.name === 'ZodError') {
                const response = createUserErrorResponse(
                    'Validation failed',
                    'VALIDATION_ERROR',
                    error
                );
                return reply.code(400).send(response);
            }

            // Handle custom application errors
            if (error instanceof AppError) {
                const response = createUserErrorResponse(
                    error.message,
                    error.code
                );
                return reply.code(error.statusCode).send(response);
            }

            // Handle repository errors (e.g., email already registered)
            if (error instanceof Error) {
                if (error.message.includes('already registered')) {
                    const response = createUserErrorResponse(
                        error.message,
                        'CONFLICT'
                    );
                    return reply.code(409).send(response);
                }
            }

            // Handle unexpected errors
            request.log.error(error);
            const response = createUserErrorResponse(
                'Internal server error',
                'INTERNAL_ERROR'
            );
            return reply.code(500).send(response);
        }
    }
}
