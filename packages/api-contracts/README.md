# @funkshan/api-contracts

API request/response schemas and contract definitions using Zod.

## Purpose

This package contains API contract definitions that ensure type safety and validation consistency between frontend and backend.

## Features

- Zod schemas for request/response validation
- Type inference from schemas
- Shared API response formats
- Common query parameter schemas

## Usage

```typescript
import {
    ApiResponseSchema,
    PaginationQuerySchema,
} from '@funkshan/api-contracts';

// Validate response
const response = ApiResponseSchema.parse(data);

// Validate query parameters
const query = PaginationQuerySchema.parse(req.query);
```

## Development

```bash
# Build the package
pnpm build

# Watch mode for development
pnpm dev

# Type check
pnpm type-check

# Clean build artifacts
pnpm clean
```
