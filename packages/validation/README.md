# @funkshan/validation

Shared validation schemas using Zod for runtime validation.

## Purpose

This package provides reusable Zod validation schemas for common data validation patterns across the Funkshan monorepo.

## Features

- Email validation
- Password validation
- MongoDB ObjectId validation
- Pagination validation
- Date range validation
- Extensible validation schemas

## Usage

```typescript
import {
    EmailSchema,
    PasswordSchema,
    ObjectIdSchema,
} from '@funkshan/validation';

// Validate email
const email = EmailSchema.parse('user@example.com');

// Validate password
const password = PasswordSchema.parse('securePassword123');

// Validate ObjectId
const userId = ObjectIdSchema.parse('507f1f77bcf86cd799439011');
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
