/**
 * Schema conversion utilities
 * Converts Zod schemas to Fastify JSON schemas
 */
import zodToJsonSchema from 'zod-to-json-schema';
import { z } from 'zod';
import { FastifySchema } from 'fastify';

/**
 * Convert a Zod schema to JSON Schema for Fastify
 */
export function zodToFastifySchema(zodSchema: any): any {
    return zodToJsonSchema(zodSchema, {
        name: undefined, // Don't add $schema or title
        $refStrategy: 'none', // Inline all references
    });
}

/**
 * Create a Fastify schema from Zod schemas
 */
export function createFastifySchema(options: {
    description?: string;
    tags?: string[];
    body?: any;
    querystring?: any;
    params?: any;
    response?: Record<number, any>;
    security?: boolean; // Whether to require authentication
}): FastifySchema {
    const schema: FastifySchema = {};

    if (options.description) {
        schema.description = options.description;
    }

    if (options.tags) {
        schema.tags = options.tags;
    }

    if (options.body) {
        schema.body = zodToFastifySchema(options.body);
    }

    if (options.querystring) {
        schema.querystring = zodToFastifySchema(options.querystring);
    }

    if (options.params) {
        schema.params = zodToFastifySchema(options.params);
    }

    if (options.response) {
        const responseSchemas: Record<number, any> = {};
        for (const [statusCode, zodSchema] of Object.entries(
            options.response
        )) {
            responseSchemas[parseInt(statusCode)] =
                zodToFastifySchema(zodSchema);
        }
        schema.response = responseSchemas;
    }

    // Add security requirement for protected routes
    if (options.security) {
        schema.security = [{ bearerAuth: [] }];
    }

    return schema;
}
