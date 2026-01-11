/**
 * Database connection utilities using Prisma
 */
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

export interface ConnectionConfig {
    isProduction?: boolean;
    datasourceUrl?: string;
    logging?: boolean;
}

export interface HealthCheckResult {
    status: 'healthy' | 'unhealthy';
    error?: string;
}

let prisma: PrismaClient | null = null;
let pool: Pool | null = null;

/**
 * Get Prisma client configuration based on environment
 * @param isProduction - Whether running in production mode
 * @param logging - Enable query logging
 */
export function getPrismaConfig(
    isProduction: boolean = false,
    logging: boolean = false
) {
    const logLevels: Prisma.LogLevel[] = logging
        ? ['query', 'info', 'warn', 'error']
        : isProduction
          ? ['warn', 'error']
          : ['error'];

    const errorFormat: 'minimal' | 'pretty' | 'colorless' = isProduction
        ? 'minimal'
        : 'pretty';

    return {
        log: logLevels,
        errorFormat,
    };
}

/**
 * Connect to PostgreSQL database using Prisma
 * @param config - Connection configuration options
 */
export async function connect(config?: ConnectionConfig): Promise<void> {
    const {
        isProduction = false,
        datasourceUrl,
        logging = false,
    } = config || {};

    try {
        // Get database URL from config or environment
        const databaseUrl = datasourceUrl || process.env.DATABASE_URL;

        if (!databaseUrl) {
            throw new Error('DATABASE_URL is required');
        }

        // Create PostgreSQL connection pool for the adapter
        pool = new Pool({ connectionString: databaseUrl });

        // Create Prisma adapter using the pool
        const adapter = new PrismaPg(pool);

        // Create Prisma Client instance with the adapter
        prisma = new PrismaClient({
            adapter,
            ...getPrismaConfig(isProduction, logging),
        });

        // Test the connection
        await prisma.$connect();
        console.log('✓ Database connected successfully');
    } catch (error) {
        console.error('✗ Database connection failed:', error);
        throw error;
    }
}

/**
 * Disconnect from PostgreSQL database
 */
export async function disconnect(): Promise<void> {
    try {
        if (prisma) {
            await prisma.$disconnect();
            prisma = null;
        }
        if (pool) {
            await pool.end();
            pool = null;
        }
        console.log('✓ Database disconnected successfully');
    } catch (error) {
        console.error('✗ Database disconnection failed:', error);
        throw error;
    }
}

/**
 * Check if database is connected
 */
export function isConnected(): boolean {
    return prisma !== null;
}

/**
 * Perform a health check on the database connection
 */
export async function healthCheck(): Promise<HealthCheckResult> {
    try {
        if (!prisma) {
            return {
                status: 'unhealthy',
                error: 'Prisma client not initialized',
            };
        }

        // Execute a simple query to check connection
        await prisma.$queryRaw`SELECT 1`;

        return {
            status: 'healthy',
        };
    } catch (error) {
        return {
            status: 'unhealthy',
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

/**
 * Get the Prisma client instance
 * Throws an error if not connected
 */
export function getPrismaClient(): PrismaClient {
    if (!prisma) {
        throw new Error('Prisma client not initialized. Call connect() first.');
    }
    return prisma;
}

/**
 * Execute a transaction
 * @param callback - Transaction callback function
 */
export async function executeTransaction<T>(
    callback: (tx: PrismaClient) => Promise<T>
): Promise<T> {
    const client = getPrismaClient();
    return await client.$transaction(async (tx: any) => {
        return await callback(tx as PrismaClient);
    });
}
