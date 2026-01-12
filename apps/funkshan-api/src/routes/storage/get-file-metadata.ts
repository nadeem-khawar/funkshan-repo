/**
 * Get File Metadata Route
 */

import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { StorageController } from '../../controllers/StorageController';

interface RouteOptions extends FastifyPluginOptions {
    storageController: StorageController;
}

export default async function getFileMetadataRoute(
    fastify: FastifyInstance,
    options: RouteOptions
) {
    const { storageController } = options;

    fastify.get(
        '/files/:fileKey/metadata',
        {
            onRequest: [fastify.authenticate],
            schema: {
                description: 'Get file metadata',
                tags: ['storage'],
                security: [{ bearerAuth: [] }],
                params: {
                    type: 'object',
                    required: ['fileKey'],
                    properties: {
                        fileKey: { type: 'string', minLength: 1 },
                    },
                },
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            key: { type: 'string' },
                            bucket: { type: 'string' },
                            size: { type: 'number' },
                            contentType: { type: 'string' },
                            uploadedAt: {
                                type: 'string',
                                format: 'date-time',
                            },
                        },
                    },
                },
            },
        },
        storageController.getFileMetadata.bind(storageController)
    );
}
