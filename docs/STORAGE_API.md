# Storage API Documentation

## Overview

The Storage API provides endpoints for generating presigned URLs to upload and download files from Hetzner S3-compatible object storage. This allows mobile clients to upload files directly to S3 without going through the backend server, improving performance and reducing bandwidth costs.

## Configuration

Add these environment variables to `apps/funkshan-api/.env`:

```env
HETZNER_S3_ENDPOINT=https://fsn1.your-objectstorage.com
HETZNER_S3_REGION=eu-central
HETZNER_S3_BUCKET=funkshan-storage
HETZNER_ACCESS_KEY_ID=your-access-key-id
HETZNER_SECRET_ACCESS_KEY=your-secret-access-key
```

## Endpoints

All endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### 1. Generate Upload URL

Generate a presigned URL for uploading a file directly to S3.

**Endpoint:** `POST /api/v1/storage/upload/presigned-url`

**Request Body:**

```json
{
    "fileName": "profile-photo.jpg",
    "contentType": "image/jpeg",
    "context": "profiles",
    "expiresIn": 3600
}
```

**Parameters:**

- `fileName` (required): Name of the file to upload
- `contentType` (required): MIME type of the file. Allowed types:
    - Images: `image/jpeg`, `image/jpg`, `image/png`, `image/webp`, `image/gif`
    - Videos: `video/mp4`, `video/quicktime`
- `context` (optional): Upload context. Options: `events`, `profiles`, `messages`. Default: `events`
- `expiresIn` (optional): URL expiration time in seconds (60-3600). Default: 3600

**Response:**

```json
{
    "uploadUrl": "https://fsn1.your-objectstorage.com/funkshan-storage/events/user123/1234567890-profile-photo.jpg?...",
    "fileKey": "events/user123/1234567890-profile-photo.jpg",
    "expiresIn": 3600,
    "maxSize": 10485760
}
```

**File Size Limits:**

- Images: 10 MB
- Videos: 100 MB
- Documents: 5 MB

### 2. Generate Download URL

Generate a presigned URL for downloading a file from S3.

**Endpoint:** `GET /api/v1/storage/download/:fileKey`

**Parameters:**

- `fileKey` (required): The file key returned from the upload URL generation
- `expiresIn` (optional): URL expiration time in seconds (60-86400). Default: 3600

**Example:**

```
GET /api/v1/storage/download/events%2Fuser123%2F1234567890-profile-photo.jpg?expiresIn=7200
```

**Response:**

```json
{
    "downloadUrl": "https://fsn1.your-objectstorage.com/funkshan-storage/events/user123/1234567890-profile-photo.jpg?...",
    "expiresIn": 7200
}
```

### 3. Delete File

Delete a file from S3 storage.

**Endpoint:** `DELETE /api/v1/storage/files/:fileKey`

**Example:**

```
DELETE /api/v1/storage/files/events%2Fuser123%2F1234567890-profile-photo.jpg
```

**Response:**

```json
{
    "success": true,
    "message": "File deleted successfully"
}
```

### 4. Get File Metadata

Get metadata about a file stored in S3.

**Endpoint:** `GET /api/v1/storage/files/:fileKey/metadata`

**Example:**

```
GET /api/v1/storage/files/events%2Fuser123%2F1234567890-profile-photo.jpg/metadata
```

**Response:**

```json
{
    "key": "events/user123/1234567890-profile-photo.jpg",
    "bucket": "funkshan-storage",
    "size": 2457812,
    "contentType": "image/jpeg",
    "uploadedAt": "2025-01-11T21:15:30.000Z"
}
```

## Mobile App Integration

### Uploading a File

1. **Request a presigned upload URL from your backend:**

```dart
// Example in Flutter/Dart
final response = await http.post(
  Uri.parse('https://your-api.com/api/v1/storage/upload/presigned-url'),
  headers: {
    'Authorization': 'Bearer $token',
    'Content-Type': 'application/json',
  },
  body: jsonEncode({
    'fileName': 'photo.jpg',
    'contentType': 'image/jpeg',
    'context': 'events',
  }),
);

final data = jsonDecode(response.body);
final uploadUrl = data['uploadUrl'];
final fileKey = data['fileKey'];
```

2. **Upload the file directly to S3:**

```dart
// Read file bytes
final bytes = await file.readAsBytes();

// Upload to S3 using presigned URL
final uploadResponse = await http.put(
  Uri.parse(uploadUrl),
  headers: {
    'Content-Type': 'image/jpeg',
  },
  body: bytes,
);

if (uploadResponse.statusCode == 200) {
  // Save fileKey to your database for later retrieval
  print('Upload successful! File key: $fileKey');
}
```

### Downloading/Displaying a File

```dart
// Get download URL
final response = await http.get(
  Uri.parse('https://your-api.com/api/v1/storage/download/${Uri.encodeComponent(fileKey)}'),
  headers: {'Authorization': 'Bearer $token'},
);

final data = jsonDecode(response.body);
final downloadUrl = data['downloadUrl'];

// Display image
Image.network(downloadUrl)
```

## File Key Format

Files are organized with the following structure:

```
{context}/{userId}/{timestamp}-{sanitized-filename}
```

Example:

```
events/user123/1705877730-my-event-photo.jpg
profiles/user456/1705877845-profile-picture.png
messages/user789/1705877920-document.pdf
```

## Error Responses

### 403 Forbidden

User attempting to access a file they don't own:

```json
{
    "statusCode": 403,
    "error": "Forbidden",
    "message": "You do not have permission to access this file"
}
```

### 429 Too Many Requests

Rate limit exceeded:

```json
{
    "code": 429,
    "error": "Rate Limit Exceeded",
    "message": "Rate limit exceeded, retry in 42 seconds",
    "expiresIn": 42
}
```

### 400 Bad Request

Invalid file type or size exceeds limit:

```json
{
    "statusCode": 400,
    "error": "Bad Request",
    "message": "Content type image/bmp is not allowed"
}
```

### 401 Unauthorized

Missing or invalid authentication token:

```json
{
    "statusCode": 401,
    "error": "Unauthorized",
    "message": "Missing authentication"
}
```

### 404 Not Found

File does not exist:

```json
{
    "statusCode": 404,
    "error": "Not Found",
    "message": "File not found"
}
```

### 500 Internal Server Error

S3 operation failed:

```json
{
    "statusCode": 500,
    "error": "Internal Server Error",
    "message": "Failed to generate upload URL"
}
```

## Security Considerations

1. **Authentication Required**: All endpoints require a valid JWT token
2. **Authorization & File Ownership**: Users can only access, download, delete, or view metadata for files they own
3. **Rate Limiting**: Upload URL generation is limited to 20 requests per minute per user
4. **File Type Validation**: Only allowed content types can be uploaded
5. **Size Limits**: Files exceeding the maximum size will be rejected
6. **Path Traversal Protection**: File names are validated to prevent path traversal attacks
7. **Expiring URLs**: All presigned URLs expire after the specified time
8. **User Isolation**: File keys include the user ID, enforcing ownership validation
9. **Context Separation**: Files are organized by context (events, profiles, messages)
10. **Audit Logging**: All file operations are logged with user ID and file key
11. **File Key Validation**: All file keys must follow the format `context/userId/timestamp-filename`

### File Ownership Validation

The API automatically validates that users can only:

- Generate download URLs for their own files
- Delete their own files
- Access metadata for their own files

Any attempt to access files owned by other users will result in a `403 Forbidden` response.

### Rate Limiting

**Upload URL Generation:**

- Maximum: 20 requests per minute per user
- Exceeding the limit returns a `429 Too Many Requests` error

**Global Rate Limit:**

- Development: 1000 requests per minute per IP
- Production: 100 requests per minute per IP

## Testing with cURL

### Generate Upload URL

```bash
curl -X POST http://localhost:3001/api/v1/storage/upload/presigned-url \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fileName": "test.jpg",
    "contentType": "image/jpeg",
    "context": "events"
  }'
```

### Upload File to S3

```bash
curl -X PUT "PRESIGNED_UPLOAD_URL" \
  -H "Content-Type: image/jpeg" \
  --data-binary @/path/to/test.jpg
```

### Generate Download URL

```bash
curl http://localhost:3001/api/v1/storage/download/events%2Fuser123%2F1234567890-test.jpg \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Delete File

```bash
curl -X DELETE http://localhost:3001/api/v1/storage/files/events%2Fuser123%2F1234567890-test.jpg \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get File Metadata

```bash
curl http://localhost:3001/api/v1/storage/files/events%2Fuser123%2F1234567890-test.jpg/metadata \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Package Usage (Internal)

If you need to use the storage service directly in other parts of your backend:

```typescript
import { StorageService } from '@funkshan/storage';

const storage = new StorageService({
    endpoint: process.env.HETZNER_S3_ENDPOINT!,
    region: process.env.HETZNER_S3_REGION!,
    accessKeyId: process.env.HETZNER_ACCESS_KEY_ID!,
    secretAccessKey: process.env.HETZNER_SECRET_ACCESS_KEY!,
    bucket: process.env.HETZNER_S3_BUCKET!,
});

// Generate upload URL
const { uploadUrl, fileKey } = await storage.generateUploadUrl({
    fileName: 'photo.jpg',
    contentType: 'image/jpeg',
    userId: 'user123',
    context: 'events',
});

// Generate download URL
const downloadUrl = await storage.generateDownloadUrl(fileKey);

// Check if file exists
const exists = await storage.fileExists(fileKey);

// Get file metadata
const metadata = await storage.getFileMetadata(fileKey);

// Delete file
await storage.deleteFile(fileKey);
```
