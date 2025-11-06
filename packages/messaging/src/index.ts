/**
 * @funkshan/messaging
 * RabbitMQ messaging infrastructure for queue-based communication
 */

// Connection
export { RabbitMQConnection, getRabbitMQConnection } from './connection';

// Publisher
export { JobPublisher } from './publisher';

// Consumer
export { Consumer } from './consumer';

// Types
export type {
    BaseJob,
    RabbitMQConfig,
    QueueOptions,
    ConsumerOptions,
    PublisherOptions,
    MessageEnvelope,
} from './types';

// Queue definitions
export { QUEUES, EXCHANGE, type QueueName } from './queues';
