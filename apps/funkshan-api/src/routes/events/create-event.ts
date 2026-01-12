/**
 * Create event route
 */
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { EventController } from '../../controllers/EventController';
import { createFastifySchema } from '../../utils/schema';
import {
    CreateEventRequestSchema,
    CreateEventSuccessResponseSchema,
    CreateEventErrorResponseSchema,
} from '@funkshan/api-contracts';

interface RouteOptions extends FastifyPluginOptions {
    eventController: EventController;
}

export default async function createEventRoute(
    fastify: FastifyInstance,
    options: RouteOptions
) {
    const { eventController } = options;

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
