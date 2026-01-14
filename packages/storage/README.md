# @funkshan/storage

Storage service for Hetzner S3-compatible object storage with presigned URL support.

## Features

- S3-compatible storage integration
- Presigned URL generation for secure uploads
- Presigned URL generation for secure downloads
- Support for multipart uploads
- File type and size validation
- Automatic key generation with user/event context

## Usage

```typescript
import { StorageService } from '@funkshan/storage';

const storage = new StorageService({
    endpoint: process.env.HETZNER_S3_ENDPOINT,
    region: process.env.HETZNER_S3_REGION,
    accessKeyId: process.env.HETZNER_ACCESS_KEY_ID,
    secretAccessKey: process.env.HETZNER_SECRET_ACCESS_KEY,
    bucket: process.env.HETZNER_S3_BUCKET,
});

// Generate presigned upload URL
const uploadUrl = await storage.generateUploadUrl({
    fileName: 'photo.jpg',
    contentType: 'image/jpeg',
    userId: 'user-123',
    context: 'events',
});

// Generate presigned download URL
const downloadUrl = await storage.generateDownloadUrl(fileKey, 3600);
```

## Configuration

Set the following environment variables:

```env
HETZNER_S3_ENDPOINT=https://fsn1.your-objectstorage.com
HETZNER_S3_REGION=eu-central
HETZNER_S3_BUCKET=funkshan-storage
HETZNER_ACCESS_KEY_ID=your-access-key
HETZNER_SECRET_ACCESS_KEY=your-secret-key
```
