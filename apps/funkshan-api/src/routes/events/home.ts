/**
 * Home events route - Returns all event lists for home screen
 */
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { EventController } from '../../controllers/EventController';
import { createFastifySchema } from '../../utils/schema';
import {
    HomeEventsQuerySchema,
    HomeEventsSuccessResponseSchema,
    HomeEventsErrorResponseSchema,
} from '@funkshan/api-contracts';

interface RouteOptions extends FastifyPluginOptions {
    eventController: EventController;
}

export default async function homeEventsRoute(
    fastify: FastifyInstance,
    options: RouteOptions
) {
    const { eventController } = options;

    // Create schema
    const schema = createFastifySchema({
        description:
            'Get all event lists for home screen (upcoming, awaiting, accepted, sent, drafts)',
        tags: ['Events'],
        querystring: HomeEventsQuerySchema,
        response: {
            200: HomeEventsSuccessResponseSchema,
            400: HomeEventsErrorResponseSchema,
            401: HomeEventsErrorResponseSchema,
            500: HomeEventsErrorResponseSchema,
        },
        security: true,
    });

    fastify.get('/home', {
        schema,
        onRequest: [fastify.authenticate], // Require authentication
        handler: eventController.getHomeEvents.bind(eventController),
    });
}
