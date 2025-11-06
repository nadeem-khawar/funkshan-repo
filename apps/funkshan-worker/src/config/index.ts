/**
 * Worker configuration
 * Load from environment variables with defaults
 */

export const config = {
    rabbitmq: {
        url: process.env.RABBITMQ_URL || 'amqp://localhost',
        exchange: process.env.RABBITMQ_EXCHANGE || 'funkshan_exchange',
    },
    worker: {
        concurrency: parseInt(process.env.WORKER_CONCURRENCY || '10'),
        retryAttempts: parseInt(process.env.WORKER_RETRY_ATTEMPTS || '3'),
        retryDelay: parseInt(process.env.WORKER_RETRY_DELAY || '5000'),
    },
    database: {
        url: process.env.DATABASE_URL,
    },
    env: process.env.NODE_ENV || 'development',
    logLevel: process.env.LOG_LEVEL || 'info',
};
