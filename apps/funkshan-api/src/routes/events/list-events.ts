/**
 * List events route - Get filtered and paginated event lists
 */
import { FastifyInstance } from 'fastify';
import { EventController } from '../../controllers/EventController';
import { EventService } from '../../services/EventService';
import { createFastifySchema } from '../../utils/schema';
import {
    ListEventsQuerySchema,
    ListEventsSuccessResponseSchema,
    ListEventsErrorResponseSchema,
} from '@funkshan/api-contracts';

export default async function listEventsRoute(fastify: FastifyInstance) {
    // Initialize service and controller
    const eventService = new EventService(fastify.prisma);
    const eventController = new EventController(eventService);

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
