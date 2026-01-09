/**
 * Event routes index
 */
import { FastifyInstance } from 'fastify';
import createEventRoute from './create-event';
import homeEventsRoute from './home';
import listEventsRoute from './list-events';

export default async function eventRoutes(fastify: FastifyInstance) {
    await fastify.register(createEventRoute);
    await fastify.register(homeEventsRoute);
    await fastify.register(listEventsRoute);
}
