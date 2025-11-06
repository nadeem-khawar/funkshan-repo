import pino from 'pino';
import type { Logger } from 'pino';
import { getRabbitMQConnection, RabbitMQConnection } from './connection';
import { BaseJob, PublisherOptions } from './types';

/**
 * RabbitMQ message publisher
 * Used to publish messages/jobs to queues
 */
export class JobPublisher {
    private connection: RabbitMQConnection;
    private logger: Logger;

    constructor(connection?: RabbitMQConnection) {
        this.connection = connection || getRabbitMQConnection();
        this.logger = pino({ name: 'job-publisher' });
    }

    /**
     * Ensure connection is established
     */
    async connect(): Promise<void> {
        if (!this.connection.isConnected()) {
            await this.connection.connect();
        }
    }

    /**
     * Publish a job to a queue
     * @param routingKey - Queue routing key (typically queue name)
     * @param job - Job data to publish
     * @param options - Publisher options
     */
    async publish<T extends BaseJob>(
        routingKey: string,
        job: T,
        options: PublisherOptions = {}
    ): Promise<boolean> {
        try {
            await this.connect();

            const channel = this.connection.getChannel();
            const exchange = this.connection.getExchange();

            // Add timestamp if not present
            const enrichedJob = {
                ...job,
                timestamp: job.timestamp || Date.now(),
                retryCount: job.retryCount || 0,
            };

            const message = Buffer.from(JSON.stringify(enrichedJob));

            const publishOptions = {
                persistent: options.persistent !== false, // default to true
                contentType: 'application/json',
                contentEncoding: 'utf-8',
                priority: options.priority || 0,
                timestamp: Date.now(),
                headers: options.headers || {},
                ...(options.expiration && { expiration: options.expiration }),
            };

            const published = channel.publish(
                exchange,
                routingKey,
                message,
                publishOptions
            );

            if (published) {
                this.logger.debug(
                    { job: enrichedJob },
                    `Published job to queue "${routingKey}"`
                );
            } else {
                this.logger.warn(
                    `Channel buffer full, job may not be published to "${routingKey}"`
                );
            }

            return published;
        } catch (error) {
            this.logger.error(
                { err: error },
                `Failed to publish job to "${routingKey}"`
            );
            throw error;
        }
    }

    /**
     * Publish multiple jobs in batch
     */
    async publishBatch<T extends BaseJob>(
        routingKey: string,
        jobs: T[],
        options: PublisherOptions = {}
    ): Promise<boolean[]> {
        const results: boolean[] = [];

        for (const job of jobs) {
            const result = await this.publish(routingKey, job, options);
            results.push(result);
        }

        return results;
    }

    /**
     * Close the connection
     */
    async close(): Promise<void> {
        await this.connection.close();
    }
}
