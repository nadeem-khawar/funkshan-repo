/**
 * Delete File Route
 */

import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { StorageController } from '../../controllers/StorageController';

interface RouteOptions extends FastifyPluginOptions {
    storageController: StorageController;
}

export default async function deleteFileRoute(
    fastify: FastifyInstance,
    options: RouteOptions
) {
    const { storageController } = options;

    fastify.delete(
        '/files/:fileKey',
        {
            onRequest: [fastify.authenticate],
            schema: {
                description: 'Delete a file from storage',
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
                            success: { type: 'boolean' },
                            message: { type: 'string' },
                        },
                    },
                },
            },
        },
        storageController.deleteFile.bind(storageController)
    );
}
