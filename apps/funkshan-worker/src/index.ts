import { getRabbitMQConnection } from '@funkshan/messaging';
import { logger } from './config/logger';
import { config } from './config';
import { ExampleConsumer } from './consumers';

/**
 * Main worker application
 * Starts all consumers and handles graceful shutdown
 */
class WorkerApplication {
    private consumers: any[] = [];
    private isShuttingDown = false;

    /**
     * Start the worker application
     */
    async start(): Promise<void> {
        try {
            logger.info('🚀 Starting Funkshan Worker...');

            // Initialize RabbitMQ connection
            const connection = getRabbitMQConnection({
                url: config.rabbitmq.url,
                exchange: config.rabbitmq.exchange,
                prefetch: config.worker.concurrency,
            });

            await connection.connect();
            logger.info('✓ Connected to RabbitMQ');

            // Initialize and start consumers
            await this.startConsumers();

            // Setup graceful shutdown handlers
            this.setupShutdownHandlers();

            logger.info('✓ Worker started successfully');
            logger.info('Waiting for messages... Press Ctrl+C to exit');
        } catch (error) {
            logger.error({ err: error }, 'Failed to start worker');
            process.exit(1);
        }
    }

    /**
     * Start all consumers
     * Add your custom consumers here
     */
    private async startConsumers(): Promise<void> {
        // Example consumer - replace with your actual consumers
        const exampleConsumer = new ExampleConsumer('example_queue', {
            prefetch: 1,
            retryAttempts: config.worker.retryAttempts,
            retryDelay: config.worker.retryDelay,
        });

        await exampleConsumer.start();
        this.consumers.push(exampleConsumer);

        // Add more consumers as needed:
        // const emailConsumer = new EmailConsumer('email_queue');
        // await emailConsumer.start();
        // this.consumers.push(emailConsumer);

        // const pushConsumer = new PushNotificationConsumer('push_notification_queue');
        // await pushConsumer.start();
        // this.consumers.push(pushConsumer);

        logger.info(`✓ Started ${this.consumers.length} consumer(s)`);
    }

    /**
     * Setup graceful shutdown handlers
     */
    private setupShutdownHandlers(): void {
        const signals: NodeJS.Signals[] = ['SIGTERM', 'SIGINT', 'SIGUSR2'];

        signals.forEach(signal => {
            process.on(signal, async () => {
                if (this.isShuttingDown) {
                    logger.warn('Forced shutdown');
                    process.exit(1);
                }

                this.isShuttingDown = true;
                logger.info(
                    `Received ${signal}, starting graceful shutdown...`
                );

                await this.shutdown();
            });
        });

        // Handle uncaught errors
        process.on('uncaught Exception', (error: Error) => {
            logger.error({ err: error }, 'Uncaught exception');
            this.shutdown().then(() => process.exit(1));
        });

        process.on(
            'unhandledRejection',
            (reason: any, promise: Promise<any>) => {
                logger.error({ reason, promise }, 'Unhandled rejection');
                this.shutdown().then(() => process.exit(1));
            }
        );
    }

    /**
     * Graceful shutdown
     */
    private async shutdown(): Promise<void> {
        logger.info('Shutting down worker gracefully...');

        try {
            // Stop all consumers
            logger.info('Stopping consumers...');
            await Promise.all(this.consumers.map(consumer => consumer.stop()));
            logger.info('✓ All consumers stopped');

            // Close RabbitMQ connection
            logger.info('Closing RabbitMQ connection...');
            const connection = getRabbitMQConnection();
            await connection.close();
            logger.info('✓ RabbitMQ connection closed');

            logger.info('✓ Worker shutdown complete');
            process.exit(0);
        } catch (error) {
            logger.error({ err: error }, 'Error during shutdown');
            process.exit(1);
        }
    }
}

// Start the worker application
const worker = new WorkerApplication();
worker.start().catch(error => {
    logger.error({ err: error }, 'Fatal error');
    process.exit(1);
});
