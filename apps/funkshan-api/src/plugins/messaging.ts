/**
 * Messaging Plugin
 * Configures RabbitMQ connection for message publishing
 */

import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import { getRabbitMQConnection, QUEUES } from '@funkshan/messaging';

declare module 'fastify' {
    interface FastifyInstance {
        messaging: {
            connection: ReturnType<typeof getRabbitMQConnection>;
        };
    }
}

async function messagingPlugin(fastify: FastifyInstance) {
    const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
    const rabbitmqExchange = process.env.RABBITMQ_EXCHANGE || 'funkshan.events';

    fastify.log.info(`Connecting to RabbitMQ at ${rabbitmqUrl}...`);

    try {
        const connection = getRabbitMQConnection({
            url: rabbitmqUrl,
            exchange: rabbitmqExchange,
            exchangeType: 'topic',
        });

        // Connect to RabbitMQ
        await connection.connect();

        const channel = connection.getChannel();

        // Assert event.published queue with dead letter configuration
        await channel.assertQueue(QUEUES.EVENT_PUBLISHED, {
            durable: true,
            arguments: {
                'x-dead-letter-exchange': 'event.published.dlx',
                'x-dead-letter-routing-key': 'event.published.dlq',
                'x-message-ttl': 86400000, // 24 hours
                'x-max-priority': 10,
            },
        });

        // Bind queue to exchange
        await channel.bindQueue(
            QUEUES.EVENT_PUBLISHED,
            rabbitmqExchange,
            QUEUES.EVENT_PUBLISHED
        );

        // Assert dead letter exchange
        await channel.assertExchange('event.published.dlx', 'topic', {
            durable: true,
        });

        // Assert dead letter queue
        await channel.assertQueue('event.published.dlq', {
            durable: true,
        });

        // Bind dead letter queue to dead letter exchange
        await channel.bindQueue(
            'event.published.dlq',
            'event.published.dlx',
            'event.published.dlq'
        );

        fastify.log.info('✓ RabbitMQ connection established');
        fastify.log.info(
            `✓ Queue "${QUEUES.EVENT_PUBLISHED}" created and bound`
        );
        fastify.log.info('✓ Dead letter exchange and queue configured');

        // Decorate fastify instance with messaging connection
        fastify.decorate('messaging', {
            connection,
        });

        // Graceful shutdown
        fastify.addHook('onClose', async () => {
            fastify.log.info('Closing RabbitMQ connection...');
            await connection.close();
        });
    } catch (error: any) {
        fastify.log.error({ err: error }, 'Failed to connect to RabbitMQ');
        // Don't throw - allow API to start even if RabbitMQ is unavailable
        // This prevents cascading failures
        fastify.log.warn('API starting without RabbitMQ connection');
    }
}

export default fp(messagingPlugin, {
    name: 'messaging',
    dependencies: [],
});
