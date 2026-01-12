/**
 * List events route - Get filtered and paginated event lists
 */
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { EventController } from '../../controllers/EventController';
import { createFastifySchema } from '../../utils/schema';
import {
    ListEventsQuerySchema,
    ListEventsSuccessResponseSchema,
    ListEventsErrorResponseSchema,
} from '@funkshan/api-contracts';

interface RouteOptions extends FastifyPluginOptions {
    eventController: EventController;
}

export default async function listEventsRoute(
    fastify: FastifyInstance,
    options: RouteOptions
) {
    const { eventController } = options;

    // Create schema
    const schema = createFastifySchema({
        description:
            'Get filtered list of events (upcoming, awaiting, accepted, sent, drafts)',
        tags: ['Events'],
        querystring: ListEventsQuerySchema,
        response: {
            200: ListEventsSuccessResponseSchema,
            400: ListEventsErrorResponseSchema,
            401: ListEventsErrorResponseSchema,
            500: ListEventsErrorResponseSchema,
        },
        security: true,
    });

    fastify.get('/', {
        schema,
        onRequest: [fastify.authenticate], // Require authentication
        handler: eventController.listEvents.bind(eventController),
    });
}
