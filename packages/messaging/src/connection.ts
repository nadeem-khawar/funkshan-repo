import * as amqplib from 'amqplib';
import pino from 'pino';
import type { Logger } from 'pino';
import { RabbitMQConfig } from './types';

/**
 * RabbitMQ connection manager
 * Handles connection lifecycle, reconnection logic, and channel management
 */
export class RabbitMQConnection {
    private connection: any = null;
    private channel: any = null;
    private config: RabbitMQConfig;
    private logger: Logger;
    private reconnectAttempts = 0;
    private isConnecting = false;
    private isClosing = false;

    constructor(config: Partial<RabbitMQConfig> = {}) {
        this.config = {
            url: config.url || process.env.RABBITMQ_URL || 'amqp://localhost',
            exchange:
                config.exchange ||
                process.env.RABBITMQ_EXCHANGE ||
                'funkshan_exchange',
            exchangeType: config.exchangeType || 'topic',
            prefetch: config.prefetch || 10,
            reconnectDelay: config.reconnectDelay || 5000,
            maxReconnectAttempts: config.maxReconnectAttempts || 10,
        };

        this.logger = pino({ name: 'rabbitmq-connection' });
    }

    /**
     * Establish connection to RabbitMQ server
     */
    async connect(): Promise<void> {
        if (this.isConnecting) {
            this.logger.warn('Connection attempt already in progress');
            return;
        }

        if (this.connection && this.channel) {
            this.logger.info('Already connected to RabbitMQ');
            return;
        }

        this.isConnecting = true;

        try {
            this.logger.info(`Connecting to RabbitMQ at ${this.config.url}...`);

            // Create connection
            this.connection = await amqplib.connect(this.config.url);

            // Create channel
            this.channel = await this.connection.createChannel();

            // Set prefetch for fair dispatch
            await this.channel.prefetch(this.config.prefetch!);

            // Assert exchange
            await this.channel.assertExchange(
                this.config.exchange,
                this.config.exchangeType!,
                { durable: true }
            );

            // Setup error handlers
            this.connection.on('error', (error: Error) => {
                this.logger.error({ err: error }, 'RabbitMQ connection error');
                this.handleConnectionError();
            });

            this.connection.on('close', () => {
                this.logger.warn('RabbitMQ connection closed');
                if (!this.isClosing) {
                    this.handleConnectionError();
                }
            });

            this.channel.on('error', (error: Error) => {
                this.logger.error({ err: error }, 'RabbitMQ channel error');
            });

            this.channel.on('close', () => {
                this.logger.warn('RabbitMQ channel closed');
            });

            this.reconnectAttempts = 0;
            this.isConnecting = false;
            this.logger.info('✓ Connected to RabbitMQ successfully');
        } catch (error) {
            this.isConnecting = false;
            this.logger.error({ err: error }, 'Failed to connect to RabbitMQ');
            await this.handleConnectionError();
            throw error;
        }
    }

    /**
     * Handle connection errors with automatic reconnection
     */
    private async handleConnectionError(): Promise<void> {
        if (this.isClosing) {
            return;
        }

        this.connection = null;
        this.channel = null;

        if (
            this.reconnectAttempts < this.config.maxReconnectAttempts! &&
            !this.isClosing
        ) {
            this.reconnectAttempts++;
            this.logger.info(
                `Attempting to reconnect (${this.reconnectAttempts}/${this.config.maxReconnectAttempts})...`
            );

            await new Promise(resolve =>
                setTimeout(resolve, this.config.reconnectDelay)
            );

            try {
                await this.connect();
            } catch (error) {
                this.logger.error({ err: error }, 'Reconnection failed');
            }
        } else {
            this.logger.error(
                'Max reconnection attempts reached. Manual intervention required.'
            );
        }
    }

    /**
     * Get the active channel
     */
    getChannel(): any {
        if (!this.channel) {
            throw new Error(
                'RabbitMQ channel not initialized. Call connect() first.'
            );
        }
        return this.channel;
    }

    /**
     * Get the active connection
     */
    getConnection(): any {
        if (!this.connection) {
            throw new Error(
                'RabbitMQ connection not initialized. Call connect() first.'
            );
        }
        return this.connection;
    }

    /**
     * Get exchange name
     */
    getExchange(): string {
        return this.config.exchange;
    }

    /**
     * Check if connected
     */
    isConnected(): boolean {
        return this.connection !== null && this.channel !== null;
    }

    /**
     * Close connection gracefully
     */
    async close(): Promise<void> {
        this.isClosing = true;

        try {
            if (this.channel) {
                this.logger.info('Closing RabbitMQ channel...');
                await this.channel.close();
                this.channel = null;
            }

            if (this.connection) {
                this.logger.info('Closing RabbitMQ connection...');
                await this.connection.close();
                this.connection = null;
            }

            this.logger.info('✓ RabbitMQ connection closed successfully');
        } catch (error) {
            this.logger.error(
                { err: error },
                'Error closing RabbitMQ connection'
            );
            throw error;
        } finally {
            this.isClosing = false;
        }
    }
}

// Singleton instance for shared connection
let connectionInstance: RabbitMQConnection | null = null;

/**
 * Get or create singleton RabbitMQ connection instance
 */
export function getRabbitMQConnection(
    config?: Partial<RabbitMQConfig>
): RabbitMQConnection {
    if (!connectionInstance) {
        connectionInstance = new RabbitMQConnection(config);
    }
    return connectionInstance;
}
