import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import mongoose from 'mongoose';

/**
 * Database plugin that handles MongoDB connection using Mongoose
 */
async function databasePlugin(
    fastify: FastifyInstance,
    options: FastifyPluginOptions
) {
    const mongoUrl =
        process.env.MONGODB_URL || 'mongodb://localhost:27017/funkshan';
    const isProduction = process.env.NODE_ENV === 'production';

    // Configure Mongoose
    mongoose.set('strictQuery', true);

    // Connection options
    const connectionOptions = {
        maxPoolSize: isProduction ? 10 : 5, // Maintain up to 10 socket connections (5 for dev)
        serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        family: 4, // Use IPv4, skip trying IPv6
        retryWrites: true,
        w: 'majority' as const,
        ...(isProduction && {
            // Production-specific options
            compressors: ['zlib' as const],
            zlibCompressionLevel: 6 as const,
            readPreference: 'primary' as const,
        }),
    };

    try {
        // Connect to MongoDB
        fastify.log.info('Connecting to MongoDB...');
        await mongoose.connect(mongoUrl, connectionOptions);
        fastify.log.info(`Connected to MongoDB: ${mongoose.connection.name}`);

        // Register mongoose instance for easy access
        fastify.decorate('mongoose', mongoose);
        fastify.decorate('db', mongoose.connection);

        // Add connection event listeners
        mongoose.connection.on('error', (err: Error) => {
            fastify.log.error({ err }, 'MongoDB connection error');
        });

        mongoose.connection.on('disconnected', () => {
            fastify.log.warn('MongoDB disconnected');
        });

        mongoose.connection.on('reconnected', () => {
            fastify.log.info('MongoDB reconnected');
        });

        // Graceful shutdown
        fastify.addHook('onClose', async () => {
            fastify.log.info('Closing MongoDB connection...');
            await mongoose.connection.close();
            fastify.log.info('MongoDB connection closed');
        });

        // Health check helper
        fastify.decorate('dbHealthCheck', async () => {
            try {
                await mongoose.connection.db?.admin().ping();
                return {
                    status: 'healthy',
                    readyState: mongoose.connection.readyState,
                    name: mongoose.connection.name,
                    host: mongoose.connection.host,
                    port: mongoose.connection.port,
                };
            } catch (error) {
                return {
                    status: 'unhealthy',
                    error:
                        error instanceof Error
                            ? error.message
                            : 'Unknown error',
                    readyState: mongoose.connection.readyState,
                };
            }
        });
    } catch (error) {
        fastify.log.error({ error }, 'Failed to connect to MongoDB');
        throw error;
    }
}

// Type extensions for FastifyInstance
declare module 'fastify' {
    interface FastifyInstance {
        mongoose: typeof mongoose;
        db: typeof mongoose.connection;
        dbHealthCheck: () => Promise<{
            status: string;
            readyState: number;
            name?: string;
            host?: string;
            port?: number;
            error?: string;
        }>;
    }
}

export default fp(databasePlugin, {
    name: 'database',
    dependencies: ['config'],
});
