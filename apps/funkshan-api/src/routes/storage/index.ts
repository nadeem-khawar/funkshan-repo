/**
 * Storage routes index
 */

import { FastifyInstance } from 'fastify';
import { StorageService } from '../../services/StorageService';
import { StorageController } from '../../controllers/StorageController';
import generateUploadUrlRoute from './generate-upload-url';
import generateDownloadUrlRoute from './generate-download-url';
import deleteFileRoute from './delete-file';
import getFileMetadataRoute from './get-file-metadata';

export default async function storageRoutes(fastify: FastifyInstance) {
    // Initialize service and controller once for all storage routes
    const storageService = new StorageService();
    const storageController = new StorageController(storageService);

    // Register routes with shared controller instance
    await fastify.register(generateUploadUrlRoute, { storageController });
    await fastify.register(generateDownloadUrlRoute, { storageController });
    await fastify.register(deleteFileRoute, { storageController });
    await fastify.register(getFileMetadataRoute, { storageController });
}
