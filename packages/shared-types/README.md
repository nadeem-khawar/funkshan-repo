# @funkshan/shared-types

Shared TypeScript types and interfaces used across the Funkshan monorepo.

## Purpose

This package contains common type definitions that are shared between frontend and backend applications to ensure type safety across the entire stack.

## Usage

```typescript
import { ApiResponse, PaginationMeta, UserRole } from '@funkshan/shared-types';
```

## Installation

This package is part of the Funkshan monorepo and is managed via PNPM workspaces.

```bash
pnpm add @funkshan/shared-types --filter <your-package>
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
