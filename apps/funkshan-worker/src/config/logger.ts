import { pino } from 'pino';

/**
 * Create configured logger instance for the worker
 */
export const logger = pino({
    name: 'funkshan-worker',
    level: process.env.LOG_LEVEL || 'info',
    transport:
        process.env.NODE_ENV === 'development'
            ? {
                  target: 'pino-pretty',
                  options: {
                      colorize: true,
                      translateTime: 'HH:MM:ss Z',
                      ignore: 'pid,hostname',
                  },
              }
            : undefined,
});
