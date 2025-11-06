# Register User API Endpoint

## Overview

This document describes the register user REST API endpoint implementation following the Funkshan architecture.

## Endpoint

```
POST /api/v1/auth/register
```

## Request

### Headers

```
Content-Type: application/json
```

### Body

```json
{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phoneNumber": "+1234567890",
    "password": "SecureP@ss123",
    "deviceId": "abc-123-device-uuid",
    "deviceType": "ios",
    "deviceName": "iPhone 13",
    "pushToken": "fcm-token-here"
}
```

### Field Validation

| Field       | Type   | Required | Validation                                 |
| ----------- | ------ | -------- | ------------------------------------------ |
| firstName   | string | Yes      | 2-50 characters                            |
| lastName    | string | Yes      | 2-50 characters                            |
| email       | string | Yes      | Valid email format                         |
| phoneNumber | string | No       | Format: +[country code][mobile number]     |
| password    | string | Yes      | 8-128 characters                           |
| deviceId    | string | Yes      | 1-255 characters, unique device identifier |
| deviceType  | enum   | No       | One of: ios, android, web                  |
| deviceName  | string | No       | Max 100 characters                         |
| pushToken   | string | No       | Max 500 characters, FCM/APNs token         |

## Response

### Success Response (201 Created)

```json
{
    "success": true,
    "data": {
        "id": "clx123abc456",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com",
        "phoneNumber": "+1234567890",
        "isEmailVerified": false,
        "createdAt": "2025-10-25T12:00:00.000Z"
    }
}
```

### Error Responses

#### Validation Error (400 Bad Request)

```json
{
    "success": false,
    "error": {
        "message": "Validation failed",
        "code": "VALIDATION_ERROR",
        "details": {
            "issues": [
                {
                    "path": ["email"],
                    "message": "Invalid email format"
                }
            ]
        }
    }
}
```

#### Conflict Error (409 Conflict)

```json
{
    "success": false,
    "error": {
        "message": "Email address is already registered",
        "code": "CONFLICT"
    }
}
```

#### Internal Server Error (500)

```json
{
    "success": false,
    "error": {
        "message": "Internal server error",
        "code": "INTERNAL_ERROR"
    }
}
```

## Architecture Implementation

The endpoint follows the layered architecture defined in the architecture document:

### 1. Schema Layer (`src/schemas/auth/register.schema.ts`)

- Defines Fastify JSON Schema for request/response validation
- Used for Swagger documentation generation

### 2. Controller Layer (`src/controllers/UserController.ts`)

- Handles HTTP concerns (request/response)
- Validates request using Zod schema from `@funkshan/api-contracts`
- Calls service layer for business logic
- Formats responses using helper functions

### 3. Service Layer (`src/services/UserService.ts`)

- Contains business logic for user registration
- Checks for existing email
- Hashes password using bcrypt
- Creates user and device in a transaction
- Uses repositories from `@funkshan/database`

### 4. Repository Layer (`@funkshan/database`)

- Provides data access through Prisma
- `UserRepository` for user operations
- `UserDeviceRepository` for device management

### 5. Route Layer (`src/routes/auth/register.ts`)

- Wires schema, controller, and Fastify instance
- Registered under `/api/v1/auth/register`

## Files Created

```
apps/funkshan-api/src/
├── controllers/
│   └── UserController.ts          # User operations controller
├── services/
│   └── UserService.ts             # User business logic
├── utils/
│   ├── password.ts                # Password hashing utilities
│   └── errors.ts                  # Custom error classes
├── schemas/
│   └── auth/
│       └── register.schema.ts     # Fastify schema for register endpoint
├── routes/
│   └── auth/
│       ├── index.ts               # Auth routes aggregator
│       └── register.ts            # Register route
└── types/
    └── fastify.d.ts               # Fastify type extensions
```

## Testing

### Using cURL

```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "password": "SecureP@ss123",
    "deviceId": "test-device-123",
    "deviceType": "web"
  }'
```

### Using Swagger UI

1. Start the server: `pnpm --filter funkshan-api dev`
2. Navigate to `http://localhost:3001/documentation`
3. Find the `POST /api/v1/auth/register` endpoint
4. Click "Try it out" and fill in the request body
5. Click "Execute"

## Next Steps

1. **Email Verification**: Implement email verification token generation and sending
2. **JWT Token Generation**: Add JWT token generation after successful registration
3. **Rate Limiting**: Configure specific rate limits for registration endpoint
4. **Tests**: Add unit and integration tests
5. **Logging**: Add structured logging for registration events

## Dependencies Added

- `bcrypt`: Password hashing
- `@types/bcrypt`: TypeScript types for bcrypt
- `@funkshan/api-contracts`: Shared API contracts with Zod validation
- `@funkshan/database`: Shared database layer with Prisma

## Database Transaction

The registration process uses a Prisma transaction to ensure atomicity:

1. Create user record
2. Create user device record

If either operation fails, both are rolled back to maintain data consistency.
