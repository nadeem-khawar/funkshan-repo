/**
 * Storage Service
 * Handles file storage operations and S3 interactions
 */

import { StorageService as S3StorageService } from '@funkshan/storage';
import type {
    UploadUrlOptions,
    UploadUrlResponse,
    FileMetadata,
} from '@funkshan/storage';

export class StorageService {
    private s3StorageService: S3StorageService;

    constructor() {
        // Initialize S3 storage service with environment configuration
        this.s3StorageService = new S3StorageService({
            endpoint: process.env.HETZNER_S3_ENDPOINT!,
            region: process.env.HETZNER_S3_REGION!,
            accessKeyId: process.env.HETZNER_ACCESS_KEY_ID!,
            secretAccessKey: process.env.HETZNER_SECRET_ACCESS_KEY!,
            bucket: process.env.HETZNER_S3_BUCKET!,
        });
    }

    /**
     * Generate presigned URL for file upload
     */
    async generateUploadUrl(
        options: UploadUrlOptions
    ): Promise<UploadUrlResponse> {
        return this.s3StorageService.generateUploadUrl(options);
    }

    /**
     * Generate presigned URL for file download
     */
    async generateDownloadUrl(
        fileKey: string,
        expiresIn?: number
    ): Promise<string> {
        return this.s3StorageService.generateDownloadUrl(fileKey, expiresIn);
    }

    /**
     * Check if file exists
     */
    async fileExists(fileKey: string): Promise<boolean> {
        return this.s3StorageService.fileExists(fileKey);
    }

    /**
     * Delete a file
     */
    async deleteFile(fileKey: string): Promise<void> {
        return this.s3StorageService.deleteFile(fileKey);
    }

    /**
     * Get file metadata
     */
    async getFileMetadata(fileKey: string): Promise<FileMetadata | null> {
        return this.s3StorageService.getFileMetadata(fileKey);
    }

    /**
     * Validate file key format and extract user ID
     */
    parseFileKey(fileKey: string): { userId: string; valid: boolean } {
        // Expected format: context/userId/timestamp-filename
        const parts = fileKey.split('/');
        if (parts.length !== 3) {
            return { userId: '', valid: false };
        }

        const [context, userId, filename] = parts;

        // Validate context
        const validContexts = ['events', 'profiles', 'messages'];
        if (!context || !validContexts.includes(context)) {
            return { userId: '', valid: false };
        }

        // Validate userId format (alphanumeric and basic chars)
        if (!userId || !/^[a-zA-Z0-9_-]+$/.test(userId)) {
            return { userId: '', valid: false };
        }

        // Validate filename has timestamp prefix
        if (!filename || !/^\d+-/.test(filename)) {
            return { userId: '', valid: false };
        }

        return { userId, valid: true };
    }

    /**
     * Verify user owns the file
     */
    verifyFileOwnership(fileKey: string, authenticatedUserId: string): boolean {
        const { userId, valid } = this.parseFileKey(fileKey);
        return valid && userId === authenticatedUserId;
    }

    /**
     * Validate file name for security
     */
    validateFileName(fileName: string): { valid: boolean; error?: string } {
        // Check for path traversal characters
        if (
            fileName.includes('..') ||
            fileName.includes('/') ||
            fileName.includes('\\')
        ) {
            return {
                valid: false,
                error: 'Invalid file name. File name cannot contain path characters.',
            };
        }

        return { valid: true };
    }
}
