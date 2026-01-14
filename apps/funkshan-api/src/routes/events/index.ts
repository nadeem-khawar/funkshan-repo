/**
 * Event routes index
 */
import { FastifyInstance } from 'fastify';
import { EventService } from '../../services/EventService';
import { EventController } from '../../controllers/EventController';
import createEventRoute from './create-event';
import homeEventsRoute from './home';
import listEventsRoute from './list-events';

export default async function eventRoutes(fastify: FastifyInstance) {
    // Initialize service and controller once for all event routes
    const eventService = new EventService(fastify.prisma);
    const eventController = new EventController(eventService);

    // Register routes with shared controller instance
    await fastify.register(createEventRoute, { eventController });
    await fastify.register(homeEventsRoute, { eventController });
    await fastify.register(listEventsRoute, { eventController });
}
