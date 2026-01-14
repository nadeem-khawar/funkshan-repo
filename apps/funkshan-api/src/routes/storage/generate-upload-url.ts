/**
 * Generate Upload URL Route
 */

import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { StorageController } from '../../controllers/StorageController';

interface RouteOptions extends FastifyPluginOptions {
    storageController: StorageController;
}

export default async function generateUploadUrlRoute(
    fastify: FastifyInstance,
    options: RouteOptions
) {
    const { storageController } = options;

    fastify.post(
        '/upload/presigned-url',
        {
            onRequest: [fastify.authenticate],
            config: {
                rateLimit: {
                    max: 20,
                    timeWindow: '1 minute',
                    keyGenerator: request => {
                        const user = request.user as any;
                        return `upload-${user.userId}`;
                    },
                },
            },
            schema: {
                description: 'Generate a presigned URL for uploading a file',
                tags: ['storage'],
                security: [{ bearerAuth: [] }],
                body: {
                    type: 'object',
                    required: ['fileName', 'contentType'],
                    properties: {
                        fileName: {
                            type: 'string',
                            minLength: 1,
                            maxLength: 255,
                        },
                        contentType: {
                            type: 'string',
                            enum: [
                                'image/jpeg',
                                'image/jpg',
                                'image/png',
                                'image/webp',
                                'image/gif',
                                'video/mp4',
                                'video/quicktime',
                            ],
                        },
                        context: {
                            type: 'string',
                            enum: ['events', 'profiles', 'messages'],
                            default: 'events',
                        },
                        expiresIn: {
                            type: 'number',
                            minimum: 60,
                            maximum: 3600,
                        },
                    },
                },
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            uploadUrl: { type: 'string' },
                            fileKey: { type: 'string' },
                            expiresIn: { type: 'number' },
                            maxSize: { type: 'number' },
                        },
                    },
                },
            },
        },
        storageController.generateUploadUrl.bind(storageController)
    );
}
