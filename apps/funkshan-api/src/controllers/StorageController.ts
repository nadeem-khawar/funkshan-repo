/**
 * Storage Controller
 * Handles HTTP requests for storage operations
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import { StorageService } from '../services/StorageService';

// Request types
interface GenerateUploadUrlBody {
    fileName: string;
    contentType: string;
    context?: 'events' | 'profiles' | 'messages';
    expiresIn?: number;
}

interface FileKeyParams {
    fileKey: string;
}

interface DownloadUrlQuery {
    expiresIn?: number;
}

interface AuthenticatedUser {
    userId: string;
}

export class StorageController {
    constructor(private storageService: StorageService) {}

    /**
     * Generate presigned URL for file upload
     */
    async generateUploadUrl(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { fileName, contentType, context, expiresIn } =
                request.body as GenerateUploadUrlBody;
            const user = request.user as AuthenticatedUser;
            const userId = user.userId;

            // Validate file name
            const fileNameValidation =
                this.storageService.validateFileName(fileName);
            if (!fileNameValidation.valid) {
                return reply.badRequest(fileNameValidation.error);
            }

            // Generate upload URL
            const result = await this.storageService.generateUploadUrl({
                fileName,
                contentType,
                userId,
                context: context || 'events',
                expiresIn: expiresIn || 3600,
            });

            request.log.info(
                { userId, fileName, context, fileKey: result.fileKey },
                'Presigned upload URL generated'
            );

            return reply.send(result);
        } catch (error) {
            request.log.error({ err: error }, 'Failed to generate upload URL');
            return reply.internalServerError('Failed to generate upload URL');
        }
    }

    /**
     * Generate presigned URL for file download
     */
    async generateDownloadUrl(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { fileKey } = request.params as FileKeyParams;
            const { expiresIn } = request.query as DownloadUrlQuery;
            const user = request.user as AuthenticatedUser;

            // Verify file ownership
            if (
                !this.storageService.verifyFileOwnership(fileKey, user.userId)
            ) {
                request.log.warn(
                    { userId: user.userId, fileKey },
                    'Unauthorized file access attempt'
                );
                return reply.forbidden(
                    'You do not have permission to access this file'
                );
            }

            // Check if file exists
            const exists = await this.storageService.fileExists(fileKey);
            if (!exists) {
                return reply.notFound('File not found');
            }

            // Generate download URL
            const downloadUrl = await this.storageService.generateDownloadUrl(
                fileKey,
                expiresIn
            );

            request.log.info(
                { userId: user.userId, fileKey },
                'Presigned download URL generated'
            );

            return reply.send({
                downloadUrl,
                expiresIn: expiresIn || 3600,
            });
        } catch (error) {
            request.log.error(
                { err: error },
                'Failed to generate download URL'
            );
            return reply.internalServerError('Failed to generate download URL');
        }
    }

    /**
     * Delete a file from storage
     */
    async deleteFile(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { fileKey } = request.params as FileKeyParams;
            const user = request.user as AuthenticatedUser;

            // Verify file ownership
            if (
                !this.storageService.verifyFileOwnership(fileKey, user.userId)
            ) {
                request.log.warn(
                    { userId: user.userId, fileKey },
                    'Unauthorized file deletion attempt'
                );
                return reply.forbidden(
                    'You do not have permission to delete this file'
                );
            }

            // Check if file exists
            const exists = await this.storageService.fileExists(fileKey);
            if (!exists) {
                return reply.notFound('File not found');
            }

            // Delete file
            await this.storageService.deleteFile(fileKey);

            request.log.info(
                { userId: user.userId, fileKey },
                'File deleted successfully'
            );

            return reply.send({
                success: true,
                message: 'File deleted successfully',
            });
        } catch (error) {
            request.log.error({ err: error }, 'Failed to delete file');
            return reply.internalServerError('Failed to delete file');
        }
    }

    /**
     * Get file metadata
     */
    async getFileMetadata(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { fileKey } = request.params as FileKeyParams;
            const user = request.user as AuthenticatedUser;

            // Verify file ownership
            if (
                !this.storageService.verifyFileOwnership(fileKey, user.userId)
            ) {
                request.log.warn(
                    { userId: user.userId, fileKey },
                    'Unauthorized metadata access attempt'
                );
                return reply.forbidden(
                    'You do not have permission to access this file'
                );
            }

            // Get metadata
            const metadata = await this.storageService.getFileMetadata(fileKey);

            if (!metadata) {
                return reply.notFound('File not found');
            }

            return reply.send(metadata);
        } catch (error) {
            request.log.error({ err: error }, 'Failed to get file metadata');
            return reply.internalServerError('Failed to get file metadata');
        }
    }
}
