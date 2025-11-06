# Funkshan Monorepo Architecture

## Table of Contents

1. [Overview](#overview)
2. [Project Structure](#project-structure)
3. [Core Design Principles](#core-design-principles)
4. [Shared Packages Architecture](#shared-packages-architecture)
5. [API Design Patterns](#api-design-patterns)
6. [Frontend Architecture](#frontend-architecture)
7. [Development Workflows](#development-workflows)
8. [Testing Strategy](#testing-strategy)
9. [Deployment & CI/CD](#deployment--cicd)
10. [Security Best Practices](#security-best-practices)
11. [Performance Optimization](#performance-optimization)

## Overview

The Funkshan project is a TypeScript-first monorepo that combines a high-performance Fastify API backend with a modern Next.js frontend. This architecture document outlines the design patterns, best practices, and conventions to ensure maintainable, scalable, and type-safe development.

### Technology Stack

- **Monorepo Management**: PNPM Workspaces
- **Backend**: Fastify + TypeScript
- **Frontend**: Next.js 16 + React 19 + TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT with @fastify/jwt
- **API Documentation**: Swagger/OpenAPI
- **Code Quality**: ESLint + Prettier + TypeScript
- **Version Management**: Changesets

## Project Structure

```
funkshan-repo/
├── apps/
│   ├── funkshan-api/          # Fastify backend application
│   └── funkshan-web/          # Next.js frontend application
├── packages/
│   ├── shared-types/          # Shared TypeScript types and interfaces
│   ├── api-contracts/         # API request/response schemas
│   ├── validation/            # Shared validation schemas (Zod)
│   ├── database/              # Database models and repositories
│   ├── utils/                 # Shared utility functions
├── docs/                      # Documentation
├── tools/                     # Build tools and scripts
└── .github/                   # CI/CD workflows
```

### Funkshan API Project Structure

```
apps/funkshan-api/
├── src/
│   ├── server.ts              # Application entry point
│   ├── app.ts                 # Fastify app configuration
│   ├── config/                # Application-specific configuration
│   │   ├── index.ts
│   │   ├── database.ts
│   │   └── env.ts
│   ├── plugins/               # Fastify plugins
│   │   ├── index.ts           # Plugin registration
│   │   ├── authentication.ts  # JWT authentication
│   │   ├── config.ts          # Environment config plugin
│   │   ├── database.ts        # Database connection
│   │   ├── documentation.ts   # Swagger/OpenAPI docs
│   │   ├── rate-limiting.ts   # Rate limiting
│   │   └── security.ts        # Security headers, CORS, etc.
│   ├── routes/                # Route definitions
│   │   ├── index.ts
│   │   ├── api.ts             # API route aggregator
│   │   ├── health.ts          # Health check endpoints
│   │   ├── auth/              # Authentication routes
│   │   │   ├── index.ts
│   │   │   ├── login.ts
│   │   │   ├── register.ts
│   │   │   └── refresh.ts
│   │   └── users/             # User management routes
│   │       ├── index.ts
│   │       ├── create.ts
│   │       ├── read.ts
│   │       ├── update.ts
│   │       └── delete.ts
│   ├── controllers/           # Request handlers
│   │   ├── AuthController.ts
│   │   └── UserController.ts
│   ├── services/              # Business logic layer
│   │   ├── AuthService.ts
│   │   └── UserService.ts
│   ├── middleware/            # Custom middleware
│   │   ├── auth.ts
│   │   ├── validation.ts
│   │   └── errorHandler.ts
│   ├── utils/                 # Utility functions
│   │   ├── errors.ts          # Custom error classes
│   │   ├── logger.ts          # Logging utilities
│   │   ├── password.ts        # Password hashing/verification
│   │   └── response.ts        # Response formatters
│   ├── types/                 # TypeScript type definitions
│   │   ├── index.ts
│   │   ├── fastify.d.ts       # Fastify type extensions
│   │   └── environment.d.ts   # Environment variable types
│   └── schemas/               # Fastify route schemas (JSON Schema)
│       ├── index.ts
│       ├── auth/              # Auth-related schemas
│       │   ├── login.schema.ts
│       │   ├── register.schema.ts
│       │   └── refresh.schema.ts
│       ├── users/             # User-related schemas
│       │   ├── create.schema.ts
│       │   ├── update.schema.ts
│       │   └── query.schema.ts
│       └── common/            # Reusable schemas
│           ├── pagination.schema.ts
│           ├── id.schema.ts
│           └── response.schema.ts
├── dist/                      # Compiled output (gitignored)
├── .env.example               # Environment variables template
├── .env                       # Local environment (gitignored)
├── eslint.config.mjs          # ESLint configuration
├── tsconfig.json              # TypeScript configuration
├── package.json
└── README.md
```

## Core Design Principles

### 1. Type Safety First

- **Principle**: All data structures, API contracts, and business logic must be type-safe
- **Implementation**: Use TypeScript strictly with `strict: true` in all packages
- **Benefits**: Reduces runtime errors, improves developer experience, enables better refactoring

### 2. Domain-Driven Design (DDD)

- **Principle**: Organize code around business domains rather than technical layers
- **Implementation**: Create domain-specific modules with clear boundaries
- **Benefits**: Better maintainability, clearer business logic separation

### 3. Contract-First API Development

- **Principle**: Define API contracts before implementation
- **Implementation**: Use OpenAPI/Swagger schemas as the source of truth
- **Benefits**: Better frontend-backend collaboration, automated type generation

### 4. Separation of Concerns

- **Principle**: Each layer should have a single responsibility
- **Implementation**: Clear separation between controllers, services, repositories, and utilities
- **Benefits**: Easier testing, better maintainability, reduced coupling

## Shared Packages Architecture

### Package: `@funkshan/shared-types`

**Purpose**: Common TypeScript interfaces and types used across frontend and backend.

```typescript
// packages/shared-types/src/user.ts
export interface User {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'user';
    createdAt: Date;
    updatedAt: Date;
}

export interface UserProfile extends Omit<User, 'role'> {
    avatar?: string;
    bio?: string;
}

// Export all types
export * from './user';
export * from './auth';
export * from './common';
```

### Package: `@funkshan/api-contracts`

**Purpose**: Request/response schemas and API contract definitions.

```typescript
// packages/api-contracts/src/auth.ts
import { z } from 'zod';

export const LoginRequestSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
});

export const LoginResponseSchema = z.object({
    user: z.object({
        id: z.string(),
        email: z.string(),
        name: z.string(),
    }),
    token: z.string(),
    refreshToken: z.string(),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
```

### Package: `@funkshan/validation`

**Purpose**: Shared validation schemas using Zod for runtime validation.

```typescript
// packages/validation/src/user.ts
import { z } from 'zod';

export const CreateUserSchema = z.object({
    email: z.string().email(),
    name: z.string().min(2).max(50),
    password: z.string().min(8).max(128),
});

export const UpdateUserSchema = CreateUserSchema.partial().omit({
    password: true,
});
```

### Package: `@funkshan/database`

**Purpose**: Shared database models (Mongoose schemas) and repository implementations.

```typescript
// packages/database/src/models/User.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IUserDocument extends Document {
    email: string;
    name: string;
    password: string;
    role: 'admin' | 'user';
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUserDocument>(
    {
        email: { type: String, required: true, unique: true },
        name: { type: String, required: true },
        password: { type: String, required: true },
        role: { type: String, enum: ['admin', 'user'], default: 'user' },
    },
    { timestamps: true }
);

export const UserModel = mongoose.model<IUserDocument>('User', UserSchema);
```

```typescript
// packages/database/src/repositories/UserRepository.ts
import { User } from '@funkshan/shared-types';
import { UserModel, IUserDocument } from '../models/User';

export interface IUserRepository {
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    create(userData: Partial<User>): Promise<User>;
    update(id: string, userData: Partial<User>): Promise<User | null>;
    delete(id: string): Promise<boolean>;
    list(options?: { skip?: number; limit?: number }): Promise<User[]>;
}

export class UserRepository implements IUserRepository {
    async findById(id: string): Promise<User | null> {
        const user = await UserModel.findById(id).lean();
        return user ? this.mapToUser(user) : null;
    }

    async findByEmail(email: string): Promise<User | null> {
        const user = await UserModel.findOne({ email }).lean();
        return user ? this.mapToUser(user) : null;
    }

    async create(userData: Partial<User>): Promise<User> {
        const user = await UserModel.create(userData);
        return this.mapToUser(user.toObject());
    }

    async update(id: string, userData: Partial<User>): Promise<User | null> {
        const user = await UserModel.findByIdAndUpdate(id, userData, {
            new: true,
        }).lean();
        return user ? this.mapToUser(user) : null;
    }

    async delete(id: string): Promise<boolean> {
        const result = await UserModel.findByIdAndDelete(id);
        return result !== null;
    }

    async list(options?: { skip?: number; limit?: number }): Promise<User[]> {
        const users = await UserModel.find()
            .skip(options?.skip || 0)
            .limit(options?.limit || 10)
            .lean();
        return users.map(this.mapToUser);
    }

    private mapToUser(doc: any): User {
        return {
            id: doc._id.toString(),
            email: doc.email,
            name: doc.name,
            role: doc.role,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        };
    }
}
```

```typescript
// packages/database/src/index.ts
export * from './models/User';
export * from './repositories/UserRepository';
export { connect, disconnect } from './connection';
```

```typescript
// packages/database/src/connection.ts
import mongoose from 'mongoose';

export async function connect(uri: string): Promise<void> {
    await mongoose.connect(uri);
    console.log('Database connected successfully');
}

export async function disconnect(): Promise<void> {
    await mongoose.disconnect();
    console.log('Database disconnected');
}
```

**Package Structure**:

```
packages/database/
├── src/
│   ├── index.ts
│   ├── connection.ts          # Database connection utilities
│   ├── models/                # Mongoose schemas
│   │   ├── index.ts
│   │   ├── User.ts
│   │   └── ...
│   └── repositories/          # Repository implementations
│       ├── index.ts
│       ├── UserRepository.ts
│       └── ...
├── package.json
└── tsconfig.json
```

**Benefits**:

- Centralized data access layer
- Reusable across multiple services or applications
- Consistent database operations
- Easier to test and mock
- Single source of truth for database schemas

### Package: `@funkshan/utils`

**Purpose**: Shared utility functions and helpers.

```typescript
// packages/utils/src/date.ts
export const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
};

export const isValidDate = (date: unknown): date is Date => {
    return date instanceof Date && !isNaN(date.getTime());
};
```

## API Design Patterns

### 1. Schema-First Route Definition

Keep route handlers thin by separating Fastify route schemas into dedicated schema files. This approach improves maintainability, reusability, and enables better documentation generation.

```typescript
// apps/funkshan-api/src/schemas/users/create.schema.ts
export const createUserSchema = {
    description: 'Create a new user',
    tags: ['users'],
    body: {
        type: 'object',
        required: ['email', 'name', 'password'],
        properties: {
            email: { type: 'string', format: 'email' },
            name: { type: 'string', minLength: 2, maxLength: 50 },
            password: { type: 'string', minLength: 8, maxLength: 128 },
        },
    },
    response: {
        201: {
            description: 'User created successfully',
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        email: { type: 'string' },
                        name: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },
            },
        },
        400: {
            description: 'Validation error',
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                error: {
                    type: 'object',
                    properties: {
                        message: { type: 'string' },
                        code: { type: 'string' },
                    },
                },
            },
        },
    },
} as const;
```

```typescript
// apps/funkshan-api/src/routes/users/create.ts
import { FastifyInstance } from 'fastify';
import { createUserSchema } from '../../schemas/users/create.schema';
import { UserController } from '../../controllers/UserController';

export default async function createUserRoute(fastify: FastifyInstance) {
    const userController = new UserController(/* dependencies */);

    fastify.post('/', {
        schema: createUserSchema,
        handler: userController.createUser.bind(userController),
    });
}
```

**Benefits**:

- Routes remain thin and focused on wiring
- Schemas are reusable and testable in isolation
- Easier to maintain OpenAPI documentation
- Better organization for complex APIs

### 2. Plugin Architecture

Fastify's plugin system should be used for all feature modules:

```typescript
// apps/funkshan-api/src/plugins/users.ts
import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import { CreateUserSchema } from '@funkshan/validation';

export default fp(async function usersPlugin(fastify: FastifyInstance) {
    await fastify.register(import('../routes/users'), { prefix: '/api/users' });
});
```

### 3. Repository Pattern

Use the shared `@funkshan/database` package for data access:

```typescript
// apps/funkshan-api/src/services/UserService.ts
import { UserRepository, IUserRepository } from '@funkshan/database';
import { CreateUserRequest, User } from '@funkshan/shared-types';

export class UserService {
    private userRepository: IUserRepository;

    constructor() {
        this.userRepository = new UserRepository();
    }

    async createUser(userData: CreateUserRequest): Promise<User> {
        // Business logic here (validation, hashing passwords, etc.)
        return this.userRepository.create(userData);
    }

    async getUserById(id: string): Promise<User | null> {
        return this.userRepository.findById(id);
    }
}
```

**Benefits**:

- Centralized data access logic in shared package
- Consistent database operations across services
- Easier testing with repository mocks
- Reusable across multiple applications

### 4. Service Layer Pattern

Business logic should be encapsulated in service classes:

```typescript
// apps/funkshan-api/src/services/UserService.ts
import { UserRepository } from '@funkshan/database';
import { CreateUserRequest, User } from '@funkshan/shared-types';
import { hashPassword } from '../utils/password';

export class UserService {
    constructor(private userRepository: UserRepository) {}

    async createUser(userData: CreateUserRequest): Promise<User> {
        // Business logic: hash password before storing
        const hashedPassword = await hashPassword(userData.password);

        return this.userRepository.create({
            ...userData,
            password: hashedPassword,
        });
    }
}
```

### 5. Controller Pattern

Controllers should handle HTTP concerns only:

```typescript
// apps/funkshan-api/src/controllers/UserController.ts
import { FastifyRequest, FastifyReply } from 'fastify';
import { CreateUserSchema } from '@funkshan/validation';

export class UserController {
    constructor(private userService: UserService) {}

    async createUser(request: FastifyRequest, reply: FastifyReply) {
        const userData = CreateUserSchema.parse(request.body);
        const user = await this.userService.createUser(userData);
        return reply.code(201).send({ data: user });
    }
}
```

### 6. Error Handling

Implement consistent error handling across the API:

```typescript
// apps/funkshan-api/src/utils/errors.ts
export class AppError extends Error {
    constructor(
        message: string,
        public statusCode: number = 500,
        public code?: string
    ) {
        super(message);
        this.name = 'AppError';
    }
}

export class ValidationError extends AppError {
    constructor(message: string) {
        super(message, 400, 'VALIDATION_ERROR');
    }
}
```

### 7. Response Standardization

Use consistent response formats:

```typescript
// packages/api-contracts/src/common.ts
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: {
        message: string;
        code?: string;
        details?: any;
    };
    meta?: {
        pagination?: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    };
}
```

## Frontend Architecture

### 1. App Router Structure

Utilize Next.js 16 App Router for optimal performance:

```
apps/funkshan-web/src/app/
├── (auth)/                    # Route groups
│   ├── login/
│   └── register/
├── (dashboard)/
│   ├── users/
│   └── settings/
├── api/                       # API routes
├── globals.css
├── layout.tsx
└── page.tsx
```

### 2. Component Architecture

Follow atomic design principles:

```
apps/funkshan-web/src/components/
├── atoms/                     # Basic building blocks
│   ├── Button/
│   ├── Input/
│   └── Typography/
├── molecules/                 # Simple component combinations
│   ├── SearchBox/
│   └── UserCard/
├── organisms/                 # Complex components
│   ├── Header/
│   ├── UserList/
│   └── Navigation/
└── templates/                 # Page layouts
    ├── DashboardLayout/
    └── AuthLayout/
```

### 3. State Management

Use React's built-in state management with strategic additions:

- **Local State**: React useState/useReducer
- **Server State**: TanStack Query (React Query)
- **Global Client State**: Zustand (when needed)
- **URL State**: Next.js router and searchParams

### 4. Data Fetching Patterns

Implement consistent data fetching with type safety:

```typescript
// apps/funkshan-web/src/lib/api.ts
import { ApiResponse, User } from '@funkshan/shared-types';

export class ApiClient {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    async getUsers(): Promise<ApiResponse<User[]>> {
        const response = await fetch(`${this.baseUrl}/api/users`);
        return response.json();
    }
}
```

### 5. Custom Hooks

Create reusable hooks for common patterns:

```typescript
// apps/funkshan-web/src/hooks/useUsers.ts
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api';

export function useUsers() {
    return useQuery({
        queryKey: ['users'],
        queryFn: () => apiClient.getUsers(),
    });
}
```

## Development Workflows

### 1. Package Development Workflow

When creating new shared packages:

1. Create package directory in `packages/`
2. Initialize with `package.json` and proper exports
3. Add to pnpm workspace
4. Configure TypeScript compilation
5. Add to build pipeline

### 2. Feature Development

1. **Contract Definition**: Define API contracts and types in shared packages
2. **Backend Implementation**: Implement API endpoints with proper validation
3. **Frontend Implementation**: Build UI components using shared types
4. **Integration Testing**: Test end-to-end functionality

### 3. Code Review Process

- **Type Safety**: Ensure all code is properly typed
- **Contract Compliance**: Verify API implementations match contracts
- **Documentation**: Update relevant documentation

## Deployment & CI/CD

### 1. Build Strategy

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
    push:
        branches: [main, develop]
    pull_request:
        branches: [main]

jobs:
    test:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v4
            - uses: pnpm/action-setup@v2
            - name: Install dependencies
              run: pnpm install --frozen-lockfile
            - name: Type check
              run: pnpm type-check
            - name: Lint
              run: pnpm lint
            - name: Test
              run: pnpm test
            - name: Build
              run: pnpm build
```

### 2. Deployment Strategy

- **Development**: Auto-deploy on push to develop branch
- **Production**: Auto-deploy on push to main branch
- **Feature Branches**: Deploy to preview environments

### 3. Environment Management

Use environment-specific configurations:

```typescript
// packages/config/src/api.ts
export const apiConfig = {
    development: {
        baseUrl: 'http://localhost:3001',
    },
    production: {
        baseUrl: process.env.API_BASE_URL!,
    },
};
```

## Security Best Practices

### 1. Input Validation

- Validate all inputs using Zod schemas
- Sanitize data before database operations
- Use parameterized queries

### 2. Authentication & Authorization

- Implement JWT with refresh tokens
- Use role-based access control (RBAC)
- Implement rate limiting

### 3. API Security

- Use HTTPS in production
- Implement CORS properly
- Add security headers with Helmet
- Implement CSRF protection

### 4. Data Protection

- Hash passwords with bcrypt
- Encrypt sensitive data at rest
- Implement audit logging

## Performance Optimization

### 1. Backend Optimization

- Use connection pooling for database
- Implement application-level caching strategies
- Optimize database queries with proper indexing
- Use compression middleware

### 2. Frontend Optimization

- Implement code splitting
- Use Next.js Image optimization
- Implement proper caching strategies
- Lazy load components and routes

### 3. Monitoring

- Implement structured logging
- Add performance metrics
- Set up error tracking
- Monitor API response times

## Package Configuration Examples

### Shared Package Template

```json
// packages/shared-types/package.json
{
    "name": "@funkshan/shared-types",
    "version": "1.0.0",
    "main": "./dist/index.js",
    "types": "./dist/index.d.ts",
    "exports": {
        ".": {
            "types": "./dist/index.d.ts",
            "default": "./dist/index.js"
        }
    },
    "scripts": {
        "build": "tsc",
        "dev": "tsc --watch",
        "clean": "rimraf dist"
    },
    "devDependencies": {
        "typescript": "^5.6.0",
        "rimraf": "^6.0.1"
    }
}
```

## Conclusion

This architecture provides a solid foundation for scalable, maintainable, and type-safe development. The key to success is consistent application of these patterns and regular review of architectural decisions as the project evolves.

Regular architecture reviews should be conducted to ensure the system continues to meet business needs and maintains high code quality standards.
