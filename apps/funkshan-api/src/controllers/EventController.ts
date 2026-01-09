/**
 * Event Controller - Handles HTTP requests for event operations
 */
import { FastifyRequest, FastifyReply } from 'fastify';
import { EventService } from '../services/EventService';
import {
    CreateEventRequestSchema,
    createEventSuccessResponse,
    createEventErrorResponse,
    ListEventsQuerySchema,
    createListEventsSuccessResponse,
    createListEventsErrorResponse,
    HomeEventsQuerySchema,
    createHomeEventsSuccessResponse,
    createHomeEventsErrorResponse,
} from '@funkshan/api-contracts';
import { AppError } from '../utils/errors';

export class EventController {
    constructor(private eventService: EventService) {}

    /**
     * Create a new event
     */
    async createEvent(request: FastifyRequest, reply: FastifyReply) {
        try {
            // Get user ID from authenticated request
            const userId = (request.user as any).userId;

            // Validate request body
            const validatedData = CreateEventRequestSchema.parse(request.body);

            // Create event
            const event = await this.eventService.createEvent(
                userId,
                validatedData
            );

            // Return success response
            const response = createEventSuccessResponse(event);
            return reply.code(201).send(response);
        } catch (error) {
            return this.handleError(error, reply);
        }
    }

    /**
     * Get home page events data
     */
    async getHomeEvents(request: FastifyRequest, reply: FastifyReply) {
        try {
            // Get user ID from authenticated request
            const userId = (request.user as any).userId;

            // Validate query parameters
            const validatedQuery = HomeEventsQuerySchema.parse(request.query);

            // Get home events data
            const data = await this.eventService.getHomeEvents(
                userId,
                validatedQuery.limit
            );

            // Return success response
            const response = createHomeEventsSuccessResponse(data);
            return reply.code(200).send(response);
        } catch (error) {
            return this.handleError(
                error,
                reply,
                createHomeEventsErrorResponse
            );
        }
    }

    /**
     * Get filtered list of events
     */
    async listEvents(request: FastifyRequest, reply: FastifyReply) {
        try {
            // Get user ID from authenticated request
            const userId = (request.user as any).userId;

            // Validate query parameters
            const validatedQuery = ListEventsQuerySchema.parse(request.query);

            // Get events
            const result = await this.eventService.getEvents(
                userId,
                validatedQuery.filter,
                validatedQuery.page,
                validatedQuery.limit,
                validatedQuery.search
            );

            // Return success response
            const response = createListEventsSuccessResponse(
                result.items,
                result.pagination
            );
            return reply.code(200).send(response);
        } catch (error) {
            return this.handleError(
                error,
                reply,
                createListEventsErrorResponse
            );
        }
    }

    /**
     * Handle errors and return appropriate responses
     */
    private handleError(
        error: unknown,
        reply: FastifyReply,
        errorResponseFn: (
            code: string,
            message: string,
            details?: unknown
        ) => any = createEventErrorResponse
    ) {
        // Handle Zod validation errors
        if (error instanceof Error && error.name === 'ZodError') {
            const response = errorResponseFn(
                'VALIDATION_ERROR',
                'Validation failed',
                error
            );
            return reply.code(400).send(response);
        }

        // Handle custom application errors
        if (error instanceof AppError) {
            const response = errorResponseFn(
                error.code || 'APPLICATION_ERROR',
                error.message
            );
            return reply.code(error.statusCode).send(response);
        }

        // Handle generic errors
        if (error instanceof Error) {
            const response = errorResponseFn('SERVER_ERROR', error.message);
            return reply.code(500).send(response);
        }

        // Unknown error
        const response = errorResponseFn(
            'UNKNOWN_ERROR',
            'An unexpected error occurred'
        );
        return reply.code(500).send(response);
    }
}
