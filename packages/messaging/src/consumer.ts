import { ConsumeMessage } from 'amqplib';
import pino from 'pino';
import type { Logger } from 'pino';
import { getRabbitMQConnection, RabbitMQConnection } from './connection';
import { BaseJob, ConsumerOptions, MessageEnvelope } from './types';

/**
 * Abstract base consumer class
 * Extend this class to create specific consumers for different job types
 */
export abstract class Consumer<T extends BaseJob = BaseJob> {
    protected connection: RabbitMQConnection;
    protected logger: Logger;
    protected options: ConsumerOptions;
    private consumerTag: string | null = null;

    constructor(
        queueName: string,
        options: Partial<ConsumerOptions> = {},
        connection?: RabbitMQConnection
    ) {
        this.connection = connection || getRabbitMQConnection();
        this.logger = pino({ name: `consumer:${queueName}` });

        this.options = {
            queueName,
            routingKey: options.routingKey || queueName,
            durable: options.durable !== false, // default to true
            autoDelete: options.autoDelete || false,
            exclusive: options.exclusive || false,
            noAck: options.noAck || false,
            prefetch: options.prefetch || 1,
            retryAttempts: options.retryAttempts || 3,
            retryDelay: options.retryDelay || 5000,
            deadLetterExchange:
                options.deadLetterExchange || `${queueName}.dlx`,
            deadLetterRoutingKey:
                options.deadLetterRoutingKey || `${queueName}.dlq`,
            messageTtl: options.messageTtl,
            maxLength: options.maxLength,
            maxPriority: options.maxPriority,
        };
    }

    /**
     * Abstract method to handle incoming messages
     * Must be implemented by subclasses
     */
    abstract handleMessage(job: T, envelope: MessageEnvelope<T>): Promise<void>;

    /**
     * Start consuming messages from the queue
     */
    async start(): Promise<void> {
        try {
            await this.connection.connect();

            const channel = this.connection.getChannel();
            const exchange = this.connection.getExchange();

            // Assert the main queue
            const queueArgs: Record<string, any> = {
                durable: this.options.durable,
                autoDelete: this.options.autoDelete,
                exclusive: this.options.exclusive,
            };

            // Add dead letter exchange if configured
            if (this.options.deadLetterExchange) {
                queueArgs['x-dead-letter-exchange'] =
                    this.options.deadLetterExchange;
                queueArgs['x-dead-letter-routing-key'] =
                    this.options.deadLetterRoutingKey;
            }

            if (this.options.messageTtl) {
                queueArgs['x-message-ttl'] = this.options.messageTtl;
            }

            if (this.options.maxLength) {
                queueArgs['x-max-length'] = this.options.maxLength;
            }

            if (this.options.maxPriority) {
                queueArgs['x-max-priority'] = this.options.maxPriority;
            }

            await channel.assertQueue(this.options.queueName, queueArgs);

            // Bind queue to exchange
            await channel.bindQueue(
                this.options.queueName,
                exchange,
                this.options.routingKey!
            );

            // Set prefetch
            await channel.prefetch(this.options.prefetch!);

            // Start consuming
            const { consumerTag } = await channel.consume(
                this.options.queueName,
                this.processMessage.bind(this),
                { noAck: this.options.noAck }
            );

            this.consumerTag = consumerTag;

            this.logger.info(
                `✓ Consumer started on queue "${this.options.queueName}"`
            );
        } catch (error) {
            this.logger.error({ err: error }, 'Failed to start consumer');
            throw error;
        }
    }

    /**
     * Process incoming message
     */
    private async processMessage(msg: ConsumeMessage | null): Promise<void> {
        if (!msg) {
            this.logger.warn('Received null message');
            return;
        }

        const channel = this.connection.getChannel();

        try {
            // Parse message content
            const content = msg.content.toString();
            const job: T = JSON.parse(content);

            // Create message envelope
            const envelope: MessageEnvelope<T> = {
                content: job,
                properties: msg.properties as any,
                fields: msg.fields,
            };

            this.logger.debug(
                {
                    queue: this.options.queueName,
                    deliveryTag: msg.fields.deliveryTag,
                    redelivered: msg.fields.redelivered,
                },
                'Processing message from queue'
            );

            // Handle the message
            await this.handleMessage(job, envelope);

            // Acknowledge message if not auto-ack
            if (!this.options.noAck) {
                channel.ack(msg);
                this.logger.debug(
                    { deliveryTag: msg.fields.deliveryTag },
                    'Message acknowledged'
                );
            }
        } catch (error) {
            this.logger.error({ err: error }, 'Error processing message');

            // Handle retry logic
            if (!this.options.noAck) {
                await this.handleMessageError(msg, error);
            }
        }
    }

    /**
     * Handle message processing errors with retry logic
     */
    private async handleMessageError(
        msg: ConsumeMessage,
        error: any
    ): Promise<void> {
        const channel = this.connection.getChannel();
        const retryCount = (msg.properties.headers?.['x-retry-count'] ||
            0) as number;

        if (retryCount < this.options.retryAttempts!) {
            // Retry: reject and requeue
            this.logger.warn(
                {
                    deliveryTag: msg.fields.deliveryTag,
                    retryCount: retryCount + 1,
                    maxRetries: this.options.retryAttempts,
                },
                'Retrying message'
            );

            // Update retry count in headers
            const headers = {
                ...msg.properties.headers,
                'x-retry-count': retryCount + 1,
                'x-last-error': error.message,
            };

            // Reject and requeue
            channel.nack(msg, false, true);
        } else {
            // Max retries reached: send to dead letter queue
            this.logger.error(
                {
                    deliveryTag: msg.fields.deliveryTag,
                    error: (error as Error).message,
                },
                'Max retry attempts reached, sending to DLQ'
            );

            // Reject without requeue (goes to DLQ if configured)
            channel.nack(msg, false, false);
        }
    }

    /**
     * Stop consuming messages
     */
    async stop(): Promise<void> {
        try {
            if (this.consumerTag) {
                const channel = this.connection.getChannel();
                await channel.cancel(this.consumerTag);
                this.consumerTag = null;
                this.logger.info(
                    `✓ Consumer stopped on queue "${this.options.queueName}"`
                );
            }
        } catch (error) {
            this.logger.error({ err: error }, 'Error stopping consumer');
            throw error;
        }
    }

    /**
     * Close the connection
     */
    async close(): Promise<void> {
        await this.stop();
        await this.connection.close();
    }
}
