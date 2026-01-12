# Storage API Security Tests

This document outlines security tests to verify that the storage endpoints are properly secured.

## Prerequisites

1. Two user accounts with valid JWT tokens (USER_A_TOKEN and USER_B_TOKEN)
2. API server running on http://localhost:3001
3. At least one file uploaded by USER_A

## Test Suite

### Test 1: Authentication Required

**Test:** Access endpoints without authentication token

```bash
# Should return 401 Unauthorized
curl -X POST http://localhost:3001/api/v1/storage/upload/presigned-url \
  -H "Content-Type: application/json" \
  -d '{"fileName": "test.jpg", "contentType": "image/jpeg"}'
```

**Expected Result:** `401 Unauthorized`

---

### Test 2: File Ownership - Download

**Test:** USER_B attempts to download USER_A's file

```bash
# Step 1: USER_A uploads a file and gets fileKey
curl -X POST http://localhost:3001/api/v1/storage/upload/presigned-url \
  -H "Authorization: Bearer USER_A_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"fileName": "private.jpg", "contentType": "image/jpeg", "context": "profiles"}'

# Save the fileKey from response (e.g., profiles/userA123/1234567890-private.jpg)

# Step 2: USER_B attempts to download USER_A's file
curl http://localhost:3001/api/v1/storage/download/profiles%2FuserA123%2F1234567890-private.jpg \
  -H "Authorization: Bearer USER_B_TOKEN"
```

**Expected Result:** `403 Forbidden` with message "You do not have permission to access this file"

---

### Test 3: File Ownership - Delete

**Test:** USER_B attempts to delete USER_A's file

```bash
curl -X DELETE http://localhost:3001/api/v1/storage/files/profiles%2FuserA123%2F1234567890-private.jpg \
  -H "Authorization: Bearer USER_B_TOKEN"
```

**Expected Result:** `403 Forbidden` with message "You do not have permission to delete this file"

---

### Test 4: File Ownership - Metadata

**Test:** USER_B attempts to access metadata of USER_A's file

```bash
curl http://localhost:3001/api/v1/storage/files/profiles%2FuserA123%2F1234567890-private.jpg/metadata \
  -H "Authorization: Bearer USER_B_TOKEN"
```

**Expected Result:** `403 Forbidden` with message "You do not have permission to access this file"

---

### Test 5: Rate Limiting - Upload URL Generation

**Test:** Exceed rate limit of 20 requests per minute

```bash
# Run this loop to generate 21 requests
for i in {1..21}; do
  echo "Request $i:"
  curl -X POST http://localhost:3001/api/v1/storage/upload/presigned-url \
    -H "Authorization: Bearer USER_A_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"fileName\": \"test$i.jpg\", \"contentType\": \"image/jpeg\"}"
  echo ""
done
```

**Expected Result:** First 20 requests succeed with `200 OK`, 21st request fails with `429 Too Many Requests`

---

### Test 6: Path Traversal Protection

**Test:** Attempt to use path traversal characters in file name

```bash
curl -X POST http://localhost:3001/api/v1/storage/upload/presigned-url \
  -H "Authorization: Bearer USER_A_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"fileName": "../../../etc/passwd", "contentType": "image/jpeg"}'
```

**Expected Result:** `400 Bad Request` with message "Invalid file name. File name cannot contain path characters."

---

### Test 7: Invalid File Key Format

**Test:** Attempt to access file with malformed fileKey

```bash
# Missing context
curl http://localhost:3001/api/v1/storage/download/invalidkey \
  -H "Authorization: Bearer USER_A_TOKEN"

# Invalid context
curl http://localhost:3001/api/v1/storage/download/hacker%2FuserA123%2F123-file.jpg \
  -H "Authorization: Bearer USER_A_TOKEN"

# Missing timestamp
curl http://localhost:3001/api/v1/storage/download/events%2FuserA123%2Ffile.jpg \
  -H "Authorization: Bearer USER_A_TOKEN"
```

**Expected Result:** All should return `403 Forbidden` due to invalid file key format

---

### Test 8: Content Type Validation

**Test:** Attempt to upload disallowed file types

```bash
# Try to upload executable file
curl -X POST http://localhost:3001/api/v1/storage/upload/presigned-url \
  -H "Authorization: Bearer USER_A_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"fileName": "malware.exe", "contentType": "application/x-msdownload"}'

# Try to upload PHP file
curl -X POST http://localhost:3001/api/v1/storage/upload/presigned-url \
  -H "Authorization: Bearer USER_A_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"fileName": "shell.php", "contentType": "application/x-php"}'
```

**Expected Result:** `400 Bad Request` due to schema validation (contentType not in enum)

---

### Test 9: Successful Authorized Access

**Test:** USER_A can access their own files

```bash
# Step 1: Generate upload URL
RESPONSE=$(curl -s -X POST http://localhost:3001/api/v1/storage/upload/presigned-url \
  -H "Authorization: Bearer USER_A_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"fileName": "myfile.jpg", "contentType": "image/jpeg", "context": "profiles"}')

FILE_KEY=$(echo $RESPONSE | jq -r '.fileKey')

# Step 2: Download (should succeed)
curl http://localhost:3001/api/v1/storage/download/$(echo $FILE_KEY | sed 's/\//%2F/g') \
  -H "Authorization: Bearer USER_A_TOKEN"

# Step 3: Get metadata (should succeed)
curl http://localhost:3001/api/v1/storage/files/$(echo $FILE_KEY | sed 's/\//%2F/g')/metadata \
  -H "Authorization: Bearer USER_A_TOKEN"

# Step 4: Delete (should succeed)
curl -X DELETE http://localhost:3001/api/v1/storage/files/$(echo $FILE_KEY | sed 's/\//%2F/g') \
  -H "Authorization: Bearer USER_A_TOKEN"
```

**Expected Result:** All operations return `200 OK` with appropriate response data

---

### Test 10: Audit Logging

**Test:** Verify security events are logged

```bash
# Check API logs for security events

# 1. Make unauthorized access attempt
curl http://localhost:3001/api/v1/storage/download/profiles%2FotherUser%2F123-file.jpg \
  -H "Authorization: Bearer USER_A_TOKEN"

# 2. Check logs (in terminal where API is running)
# Look for: "Unauthorized file access attempt" with userId and fileKey
```

**Expected Result:** Log entry with level `warn` containing:

- `"Unauthorized file access attempt"`
- `userId: "USER_A_ID"`
- `fileKey: "profiles/otherUser/123-file.jpg"`

---

## Security Checklist

After running all tests, verify:

- [ ] All endpoints require authentication (401 without token)
- [ ] Users cannot download files owned by others (403)
- [ ] Users cannot delete files owned by others (403)
- [ ] Users cannot access metadata of files owned by others (403)
- [ ] Rate limiting prevents abuse (429 after 20 requests/min)
- [ ] Path traversal attacks are blocked (400)
- [ ] Invalid file keys are rejected (403)
- [ ] Only allowed file types can be uploaded (400)
- [ ] Users can successfully access their own files (200)
- [ ] Security events are logged with appropriate details

## Automated Test Script

Here's a complete bash script to run all security tests:

```bash
#!/bin/bash

# Configuration
API_URL="http://localhost:3001/api/v1/storage"
USER_A_TOKEN="your-user-a-token"
USER_B_TOKEN="your-user-b-token"

echo "=== Storage API Security Tests ==="
echo ""

# Test 1: No Authentication
echo "Test 1: Authentication Required"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST $API_URL/upload/presigned-url \
  -H "Content-Type: application/json" \
  -d '{"fileName": "test.jpg", "contentType": "image/jpeg"}')
HTTP_STATUS=$(echo "$RESPONSE" | grep HTTP_STATUS | cut -d: -f2)
if [ "$HTTP_STATUS" = "401" ]; then
  echo "✓ PASS: Returns 401 Unauthorized"
else
  echo "✗ FAIL: Expected 401, got $HTTP_STATUS"
fi
echo ""

# Test 2: File Ownership - Setup
echo "Test 2: File Ownership Validation"
echo "Creating file as USER_A..."
RESPONSE=$(curl -s -X POST $API_URL/upload/presigned-url \
  -H "Authorization: Bearer $USER_A_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"fileName": "private.jpg", "contentType": "image/jpeg", "context": "profiles"}')
FILE_KEY=$(echo $RESPONSE | jq -r '.fileKey')
echo "File key: $FILE_KEY"

# URL encode file key
ENCODED_KEY=$(echo $FILE_KEY | sed 's/\//%2F/g')

# Test 2a: USER_B tries to download
echo "USER_B attempting to download USER_A's file..."
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -H "Authorization: Bearer $USER_B_TOKEN" \
  $API_URL/download/$ENCODED_KEY)
HTTP_STATUS=$(echo "$RESPONSE" | grep HTTP_STATUS | cut -d: -f2)
if [ "$HTTP_STATUS" = "403" ]; then
  echo "✓ PASS: Download blocked with 403 Forbidden"
else
  echo "✗ FAIL: Expected 403, got $HTTP_STATUS"
fi

# Test 2b: USER_B tries to delete
echo "USER_B attempting to delete USER_A's file..."
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X DELETE \
  -H "Authorization: Bearer $USER_B_TOKEN" \
  $API_URL/files/$ENCODED_KEY)
HTTP_STATUS=$(echo "$RESPONSE" | grep HTTP_STATUS | cut -d: -f2)
if [ "$HTTP_STATUS" = "403" ]; then
  echo "✓ PASS: Delete blocked with 403 Forbidden"
else
  echo "✗ FAIL: Expected 403, got $HTTP_STATUS"
fi

# Test 2c: USER_B tries to get metadata
echo "USER_B attempting to access metadata..."
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -H "Authorization: Bearer $USER_B_TOKEN" \
  $API_URL/files/$ENCODED_KEY/metadata)
HTTP_STATUS=$(echo "$RESPONSE" | grep HTTP_STATUS | cut -d: -f2)
if [ "$HTTP_STATUS" = "403" ]; then
  echo "✓ PASS: Metadata access blocked with 403 Forbidden"
else
  echo "✗ FAIL: Expected 403, got $HTTP_STATUS"
fi
echo ""

# Test 3: Path Traversal
echo "Test 3: Path Traversal Protection"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST $API_URL/upload/presigned-url \
  -H "Authorization: Bearer $USER_A_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"fileName": "../../../etc/passwd", "contentType": "image/jpeg"}')
HTTP_STATUS=$(echo "$RESPONSE" | grep HTTP_STATUS | cut -d: -f2)
if [ "$HTTP_STATUS" = "400" ]; then
  echo "✓ PASS: Path traversal blocked with 400 Bad Request"
else
  echo "✗ FAIL: Expected 400, got $HTTP_STATUS"
fi
echo ""

# Test 4: Rate Limiting
echo "Test 4: Rate Limiting (this may take a moment...)"
SUCCESS_COUNT=0
RATE_LIMITED=false
for i in {1..21}; do
  RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST $API_URL/upload/presigned-url \
    -H "Authorization: Bearer $USER_A_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"fileName\": \"test$i.jpg\", \"contentType\": \"image/jpeg\"}")
  HTTP_STATUS=$(echo "$RESPONSE" | grep HTTP_STATUS | cut -d: -f2)

  if [ "$HTTP_STATUS" = "200" ]; then
    ((SUCCESS_COUNT++))
  elif [ "$HTTP_STATUS" = "429" ]; then
    RATE_LIMITED=true
    break
  fi
done

if [ "$SUCCESS_COUNT" -le 20 ] && [ "$RATE_LIMITED" = true ]; then
  echo "✓ PASS: Rate limit enforced ($SUCCESS_COUNT successful, then 429)"
else
  echo "✗ FAIL: Rate limit not working properly"
fi
echo ""

echo "=== Security Tests Complete ==="
```

Save this as `test-storage-security.sh`, make it executable (`chmod +x test-storage-security.sh`), and run it with your actual JWT tokens.

## Notes

- Some tests require actual file uploads to S3, so ensure your Hetzner credentials are configured
- The rate limiting test will temporarily exhaust your rate limit - wait 1 minute before making more requests
- All security violations are logged with `warn` level - check your API logs for security monitoring
