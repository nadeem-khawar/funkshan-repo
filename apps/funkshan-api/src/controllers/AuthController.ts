/**
 * Auth Controller - Handles HTTP requests for authentication operations
 */
import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from '../services/AuthService';
import {
    LoginRequestSchema,
    createLoginSuccessResponse,
    createLoginErrorResponse,
    RefreshTokenRequestSchema,
    createRefreshTokenSuccessResponse,
    createRefreshTokenErrorResponse,
} from '@funkshan/api-contracts';
import { AppError } from '../utils/errors';

export class AuthController {
    constructor(private authService: AuthService) {}

    /**
     * User login with email and password
     */
    async login(request: FastifyRequest, reply: FastifyReply) {
        try {
            // Validate request body with Zod
            const validatedData = LoginRequestSchema.parse(request.body);

            // Attempt login
            const result = await this.authService.login(validatedData);

            // Return success response
            const response = createLoginSuccessResponse(
                result.user,
                result.accessToken,
                result.refreshToken,
                result.expiresIn
            );

            return reply.code(200).send(response);
        } catch (error) {
            // Handle Zod validation errors
            if (error instanceof Error && error.name === 'ZodError') {
                const response = createLoginErrorResponse(
                    'VALIDATION_ERROR',
                    'Validation failed',
                    error
                );
                return reply.code(400).send(response);
            }

            // Handle custom application errors
            if (error instanceof AppError) {
                const response = createLoginErrorResponse(
                    error.code || 'APPLICATION_ERROR',
                    error.message
                );
                return reply.code(error.statusCode).send(response);
            }

            // Handle authentication errors
            if (error instanceof Error) {
                if (error.message.includes('Invalid email or password')) {
                    const response = createLoginErrorResponse(
                        'INVALID_CREDENTIALS',
                        error.message
                    );
                    return reply.code(401).send(response);
                }

                if (
                    error.message.includes('blocked') ||
                    error.message.includes('inactive')
                ) {
                    const response = createLoginErrorResponse(
                        'ACCOUNT_RESTRICTED',
                        error.message
                    );
                    return reply.code(403).send(response);
                }
            }

            // Handle unexpected errors
            request.log.error(error);
            const response = createLoginErrorResponse(
                'INTERNAL_ERROR',
                'Internal server error'
            );
            return reply.code(500).send(response);
        }
    }

    /**
     * Refresh access token using refresh token
     */
    async refreshToken(request: FastifyRequest, reply: FastifyReply) {
        try {
            // Validate request body with Zod
            const validatedData = RefreshTokenRequestSchema.parse(request.body);

            // Attempt token refresh
            const result = await this.authService.refreshToken(
                validatedData.refreshToken
            );

            // Return success response
            const response = createRefreshTokenSuccessResponse(
                result.accessToken,
                result.refreshToken,
                result.expiresIn
            );

            return reply.code(200).send(response);
        } catch (error) {
            // Handle Zod validation errors
            if (error instanceof Error && error.name === 'ZodError') {
                const response = createRefreshTokenErrorResponse(
                    'VALIDATION_ERROR',
                    'Validation failed',
                    error
                );
                return reply.code(400).send(response);
            }

            // Handle custom application errors
            if (error instanceof AppError) {
                const response = createRefreshTokenErrorResponse(
                    error.code || 'APPLICATION_ERROR',
                    error.message
                );
                return reply.code(error.statusCode).send(response);
            }

            // Handle token errors
            if (error instanceof Error) {
                if (
                    error.message.includes(
                        'Invalid or expired refresh token'
                    ) ||
                    error.message.includes('User not found or inactive')
                ) {
                    const response = createRefreshTokenErrorResponse(
                        'INVALID_REFRESH_TOKEN',
                        error.message
                    );
                    return reply.code(401).send(response);
                }
            }

            // Handle unexpected errors
            request.log.error(error);
            const response = createRefreshTokenErrorResponse(
                'INTERNAL_ERROR',
                'Internal server error'
            );
            return reply.code(500).send(response);
        }
    }
}
