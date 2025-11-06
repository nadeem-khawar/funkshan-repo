/**
 * Queue definitions
 * Add your application-specific queue names here
 */
export const QUEUES = {
    // Example queues - customize based on your needs
    EMAIL: 'email_queue',
    PUSH_NOTIFICATION: 'push_notification_queue',
} as const;

/**
 * Exchange name
 */
export const EXCHANGE = process.env.RABBITMQ_EXCHANGE || 'funkshan_exchange';

/**
 * Queue type helper
 */
export type QueueName = (typeof QUEUES)[keyof typeof QUEUES];
