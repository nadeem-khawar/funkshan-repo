/**
 * Create event route
 */
import { FastifyInstance } from 'fastify';
import { EventController } from '../../controllers/EventController';
import { EventService } from '../../services/EventService';
import { createFastifySchema } from '../../utils/schema';
import {
    CreateEventRequestSchema,
    CreateEventSuccessResponseSchema,
    CreateEventErrorResponseSchema,
} from '@funkshan/api-contracts';

export default async function createEventRoute(fastify: FastifyInstance) {
    // Initialize service and controller
    const eventService = new EventService(fastify.prisma);
    const eventController = new EventController(eventService);

    // Create schema
    const schema = createFastifySchema({
        description: 'Create a new event with guests and checkin agents',
        tags: ['Events'],
        body: CreateEventRequestSchema,
        response: {
            201: CreateEventSuccessResponseSchema,
            400: CreateEventErrorResponseSchema,
            401: CreateEventErrorResponseSchema,
            500: CreateEventErrorResponseSchema,
        },
        security: true,
    });

    fastify.post('/', {
        schema,
        onRequest: [fastify.authenticate], // Require authentication
        handler: eventController.createEvent.bind(eventController),
    });
}
