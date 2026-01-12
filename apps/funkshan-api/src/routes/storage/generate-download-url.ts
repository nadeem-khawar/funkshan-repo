/**
 * Generate Download URL Route
 */

import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { StorageController } from '../../controllers/StorageController';

interface RouteOptions extends FastifyPluginOptions {
    storageController: StorageController;
}

export default async function generateDownloadUrlRoute(
    fastify: FastifyInstance,
    options: RouteOptions
) {
    const { storageController } = options;

    fastify.get(
        '/download/:fileKey',
        {
            onRequest: [fastify.authenticate],
            schema: {
                description: 'Generate a presigned URL for downloading a file',
                tags: ['storage'],
                security: [{ bearerAuth: [] }],
                params: {
                    type: 'object',
                    required: ['fileKey'],
                    properties: {
                        fileKey: { type: 'string', minLength: 1 },
                    },
                },
                querystring: {
                    type: 'object',
                    properties: {
                        expiresIn: {
                            type: 'number',
                            minimum: 60,
                            maximum: 86400,
                        },
                    },
                },
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            downloadUrl: { type: 'string' },
                            expiresIn: { type: 'number' },
                        },
                    },
                },
            },
        },
        storageController.generateDownloadUrl.bind(storageController)
    );
}
