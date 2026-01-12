/**
 * Storage service types
 */

export interface StorageConfig {
    endpoint: string;
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    bucket: string;
    forcePathStyle?: boolean;
}

export interface UploadUrlOptions {
    fileName: string;
    contentType: string;
    userId: string;
    context?: 'events' | 'profiles' | 'messages';
    maxSize?: number;
    expiresIn?: number;
}

export interface UploadUrlResponse {
    uploadUrl: string;
    fileKey: string;
    expiresIn: number;
    maxSize?: number;
}

export interface FileMetadata {
    key: string;
    bucket: string;
    size?: number;
    contentType?: string;
    uploadedAt: Date;
}

export const ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
] as const;

export const ALLOWED_VIDEO_TYPES = [
    'video/mp4',
    'video/quicktime',
    'video/x-msvideo',
] as const;

export const MAX_FILE_SIZES = {
    image: 10 * 1024 * 1024, // 10MB
    video: 100 * 1024 * 1024, // 100MB
    document: 5 * 1024 * 1024, // 5MB
} as const;
