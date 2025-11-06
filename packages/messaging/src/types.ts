/**
 * Base job interface that all job types should extend
 */
export interface BaseJob {
    type: string;
    timestamp?: number;
    retryCount?: number;
}

/**
 * RabbitMQ connection configuration
 */
export interface RabbitMQConfig {
    url: string;
    exchange: string;
    exchangeType?: 'direct' | 'topic' | 'fanout' | 'headers';
    prefetch?: number;
    reconnectDelay?: number;
    maxReconnectAttempts?: number;
}

/**
 * Queue configuration options
 */
export interface QueueOptions {
    durable?: boolean;
    autoDelete?: boolean;
    exclusive?: boolean;
    deadLetterExchange?: string;
    deadLetterRoutingKey?: string;
    messageTtl?: number;
    maxLength?: number;
    maxPriority?: number;
}

/**
 * Consumer configuration options
 */
export interface ConsumerOptions extends QueueOptions {
    queueName: string;
    routingKey?: string;
    noAck?: boolean;
    prefetch?: number;
    retryAttempts?: number;
    retryDelay?: number;
}

/**
 * Publisher configuration options
 */
export interface PublisherOptions {
    persistent?: boolean;
    priority?: number;
    expiration?: string;
    headers?: Record<string, any>;
}

/**
 * Message envelope containing metadata
 */
export interface MessageEnvelope<T = any> {
    content: T;
    properties: {
        contentType: string;
        contentEncoding: string;
        headers: Record<string, any>;
        deliveryMode: number;
        priority: number;
        correlationId?: string;
        replyTo?: string;
        expiration?: string;
        messageId?: string;
        timestamp?: number;
        type?: string;
        userId?: string;
        appId?: string;
    };
    fields: {
        deliveryTag: number;
        redelivered: boolean;
        exchange: string;
        routingKey: string;
    };
}
