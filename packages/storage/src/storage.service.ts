/**
 * Storage Service
 * Handles S3-compatible object storage operations with Hetzner
 */

import {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
    DeleteObjectCommand,
    HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import pino from 'pino';
import type { Logger } from 'pino';
import type {
    StorageConfig,
    UploadUrlOptions,
    UploadUrlResponse,
    FileMetadata,
} from './types';
import {
    ALLOWED_IMAGE_TYPES,
    ALLOWED_VIDEO_TYPES,
    MAX_FILE_SIZES,
} from './types';

export class StorageService {
    private client: S3Client;
    private bucket: string;
    private logger: Logger;

    constructor(config: StorageConfig) {
        this.bucket = config.bucket;
        this.logger = pino({ name: 'storage-service' });

        this.client = new S3Client({
            region: config.region,
            endpoint: config.endpoint,
            credentials: {
                accessKeyId: config.accessKeyId,
                secretAccessKey: config.secretAccessKey,
            },
            forcePathStyle: config.forcePathStyle ?? true, // Important for S3-compatible services
        });

        this.logger.info('Storage service initialized with Hetzner S3');
    }

    /**
     * Generate a presigned URL for uploading a file
     */
    async generateUploadUrl(
        options: UploadUrlOptions
    ): Promise<UploadUrlResponse> {
        try {
            // Validate content type
            this.validateContentType(options.contentType);

            // Generate unique file key
            const fileKey = this.generateFileKey(
                options.userId,
                options.fileName,
                options.context
            );

            // Determine max size based on content type
            const maxSize =
                options.maxSize ?? this.getMaxFileSize(options.contentType);

            // Create the command
            const command = new PutObjectCommand({
                Bucket: this.bucket,
                Key: fileKey,
                ContentType: options.contentType,
                // Add metadata
                Metadata: {
                    userId: options.userId,
                    originalFileName: options.fileName,
                    uploadedAt: new Date().toISOString(),
                },
            });

            // Generate presigned URL
            const expiresIn = options.expiresIn ?? 3600; // Default 1 hour
            const uploadUrl = await getSignedUrl(this.client, command, {
                expiresIn,
            });

            this.logger.info(
                {
                    fileKey,
                    userId: options.userId,
                    contentType: options.contentType,
                },
                'Generated upload presigned URL'
            );

            return {
                uploadUrl,
                fileKey,
                expiresIn,
                maxSize,
            };
        } catch (error) {
            this.logger.error({ err: error }, 'Failed to generate upload URL');
            throw new Error('Failed to generate upload URL');
        }
    }

    /**
     * Generate a presigned URL for downloading a file
     */
    async generateDownloadUrl(
        fileKey: string,
        expiresIn: number = 3600
    ): Promise<string> {
        try {
            const command = new GetObjectCommand({
                Bucket: this.bucket,
                Key: fileKey,
            });

            const downloadUrl = await getSignedUrl(this.client, command, {
                expiresIn,
            });

            this.logger.info(
                { fileKey, expiresIn },
                'Generated download presigned URL'
            );

            return downloadUrl;
        } catch (error) {
            this.logger.error(
                { err: error },
                'Failed to generate download URL'
            );
            throw new Error('Failed to generate download URL');
        }
    }

    /**
     * Delete a file from storage
     */
    async deleteFile(fileKey: string): Promise<void> {
        try {
            const command = new DeleteObjectCommand({
                Bucket: this.bucket,
                Key: fileKey,
            });

            await this.client.send(command);

            this.logger.info({ fileKey }, 'File deleted from storage');
        } catch (error) {
            this.logger.error({ err: error, fileKey }, 'Failed to delete file');
            throw new Error('Failed to delete file');
        }
    }

    /**
     * Get file metadata
     */
    async getFileMetadata(fileKey: string): Promise<FileMetadata> {
        try {
            const command = new HeadObjectCommand({
                Bucket: this.bucket,
                Key: fileKey,
            });

            const response = await this.client.send(command);

            return {
                key: fileKey,
                bucket: this.bucket,
                size: response.ContentLength,
                contentType: response.ContentType,
                uploadedAt: response.LastModified || new Date(),
            };
        } catch (error) {
            this.logger.error(
                { err: error, fileKey },
                'Failed to get file metadata'
            );
            throw new Error('File not found');
        }
    }

    /**
     * Check if file exists
     */
    async fileExists(fileKey: string): Promise<boolean> {
        try {
            await this.getFileMetadata(fileKey);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Generate a unique file key with user/context path
     */
    private generateFileKey(
        userId: string,
        fileName: string,
        context: string = 'general'
    ): string {
        const timestamp = Date.now();
        const sanitizedFileName = this.sanitizeFileName(fileName);
        return `${context}/${userId}/${timestamp}-${sanitizedFileName}`;
    }

    /**
     * Sanitize file name to remove special characters
     */
    private sanitizeFileName(fileName: string): string {
        return fileName
            .replace(/[^a-zA-Z0-9.-]/g, '-')
            .replace(/-+/g, '-')
            .toLowerCase();
    }

    /**
     * Validate content type
     */
    private validateContentType(contentType: string): void {
        const allowedTypes = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];

        if (!allowedTypes.includes(contentType as any)) {
            throw new Error(`Content type ${contentType} is not allowed`);
        }
    }

    /**
     * Get maximum file size based on content type
     */
    private getMaxFileSize(contentType: string): number {
        if (ALLOWED_IMAGE_TYPES.includes(contentType as any)) {
            return MAX_FILE_SIZES.image;
        }
        if (ALLOWED_VIDEO_TYPES.includes(contentType as any)) {
            return MAX_FILE_SIZES.video;
        }
        return MAX_FILE_SIZES.document;
    }

    /**
     * Close the S3 client connection
     */
    async close(): Promise<void> {
        this.client.destroy();
        this.logger.info('Storage service connection closed');
    }
}
