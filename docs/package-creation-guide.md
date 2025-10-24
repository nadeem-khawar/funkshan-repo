# Package Creation Guide

## Overview

This guide provides step-by-step instructions for creating new packages in the Funkshan monorepo following enterprise architecture principles.

## Package Template Structure

### Basic Package Structure

```
packages/[package-name]/
├── src/
│   ├── index.ts              # Main exports
│   ├── types/                # TypeScript type definitions
│   ├── interfaces/           # Interface definitions
│   ├── implementations/      # Concrete implementations
│   ├── utils/                # Utility functions
│   └── __tests__/           # Unit tests
├── package.json             # Package configuration
├── tsconfig.json           # TypeScript configuration
├── README.md               # Package documentation
└── CHANGELOG.md            # Change log
```

### Package.json Template

```json
{
    "name": "@funkshan/[package-name]",
    "version": "1.0.0",
    "description": "Description of the package",
    "main": "dist/index.js",
    "types": "dist/index.d.ts",
    "scripts": {
        "build": "tsc",
        "test": "jest",
        "test:watch": "jest --watch",
        "test:coverage": "jest --coverage",
        "lint": "eslint src --ext .ts",
        "lint:fix": "eslint src --ext .ts --fix"
    },
    "keywords": ["funkshan", "enterprise", "package-name"],
    "author": "Funkshan Team",
    "license": "MIT",
    "publishConfig": {
        "access": "restricted"
    },
    "files": ["dist", "README.md", "CHANGELOG.md"],
    "dependencies": {},
    "devDependencies": {
        "@types/jest": "^29.0.0",
        "@types/node": "^22.0.0",
        "jest": "^29.0.0",
        "typescript": "^5.6.0"
    },
    "peerDependencies": {},
    "engines": {
        "node": ">=18.0.0"
    }
}
```

## Step-by-Step Package Creation

### 1. Create Package Directory

```bash
mkdir -p packages/[package-name]/src
cd packages/[package-name]
```

### 2. Initialize Package

```bash
# Copy template files
cp ../../templates/package.json ./
cp ../../templates/tsconfig.json ./
cp ../../templates/README.template.md ./README.md
cp ../../templates/jest.config.js ./

# Update package.json with specific details
# Update README.md with package-specific information
```

### 3. Implement Core Functionality

```typescript
// src/index.ts - Main export file
export * from './interfaces';
export * from './implementations';
export * from './types';
export * from './utils';

// Default export if applicable
export { default as DefaultExport } from './implementations/DefaultImplementation';
```

### 4. Define Types and Interfaces

```typescript
// src/types/index.ts
export interface BaseEntity {
    id: string;
    createdAt: Date;
    updatedAt: Date;
}

export type EntityId = string;

export interface DomainEvent {
    eventId: string;
    eventType: string;
    aggregateId: string;
    occurredAt: Date;
    version: number;
}
```

### 5. Add Tests

```typescript
// src/__tests__/implementation.test.ts
import { Implementation } from '../implementations/Implementation';

describe('Implementation', () => {
    let implementation: Implementation;

    beforeEach(() => {
        implementation = new Implementation();
    });

    describe('method', () => {
        it('should return expected result', () => {
            // Arrange
            const input = 'test input';
            const expected = 'expected output';

            // Act
            const result = implementation.method(input);

            // Assert
            expect(result).toBe(expected);
        });
    });
});
```

## Specific Package Examples

### 1. Shared Types Package

```bash
# Create the package
mkdir -p packages/shared/types/src
cd packages/shared/types
```

```typescript
// src/common.ts
export interface BaseEntity {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    version: number;
}

export interface PaginationOptions {
    page: number;
    limit: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

export interface DomainEvent {
    eventId: string;
    eventType: string;
    aggregateId: string;
    aggregateType: string;
    occurredAt: Date;
    version: number;
    payload: Record<string, any>;
}

export interface UseCase<TRequest, TResponse> {
    execute(request: TRequest): Promise<TResponse>;
}

export interface Repository<T, ID = string> {
    findById(id: ID): Promise<T | null>;
    findAll(options?: PaginationOptions): Promise<PaginatedResult<T>>;
    save(entity: T): Promise<T>;
    update(id: ID, updates: Partial<T>): Promise<T>;
    delete(id: ID): Promise<void>;
}
```

### 2. Error Handling Package

```bash
mkdir -p packages/shared/errors/src
cd packages/shared/errors
```

```typescript
// src/base.ts
export abstract class AppError extends Error {
    abstract readonly statusCode: number;
    abstract readonly errorCode: string;
    abstract readonly category: ErrorCategory;

    constructor(
        message: string,
        public readonly context?: Record<string, any>,
        public readonly cause?: Error
    ) {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }

    toJSON() {
        return {
            name: this.name,
            message: this.message,
            statusCode: this.statusCode,
            errorCode: this.errorCode,
            category: this.category,
            context: this.context,
            stack: this.stack,
        };
    }
}

export enum ErrorCategory {
    VALIDATION = 'VALIDATION',
    BUSINESS = 'BUSINESS',
    INFRASTRUCTURE = 'INFRASTRUCTURE',
    SECURITY = 'SECURITY',
    EXTERNAL = 'EXTERNAL',
}

// src/domain.ts
export class ValidationError extends AppError {
    readonly statusCode = 400;
    readonly errorCode = 'VALIDATION_ERROR';
    readonly category = ErrorCategory.VALIDATION;
}

export class NotFoundError extends AppError {
    readonly statusCode = 404;
    readonly errorCode = 'NOT_FOUND';
    readonly category = ErrorCategory.BUSINESS;
}

export class UnauthorizedError extends AppError {
    readonly statusCode = 401;
    readonly errorCode = 'UNAUTHORIZED';
    readonly category = ErrorCategory.SECURITY;
}

export class ForbiddenError extends AppError {
    readonly statusCode = 403;
    readonly errorCode = 'FORBIDDEN';
    readonly category = ErrorCategory.SECURITY;
}

export class ConflictError extends AppError {
    readonly statusCode = 409;
    readonly errorCode = 'CONFLICT';
    readonly category = ErrorCategory.BUSINESS;
}

export class InternalServerError extends AppError {
    readonly statusCode = 500;
    readonly errorCode = 'INTERNAL_SERVER_ERROR';
    readonly category = ErrorCategory.INFRASTRUCTURE;
}
```

### 3. Domain Package Template

```bash
mkdir -p packages/core/user-domain/src/{entities,value-objects,services,repositories,events}
cd packages/core/user-domain
```

```typescript
// src/entities/User.ts
import { BaseEntity } from '@funkshan/shared-types';
import { Email } from '../value-objects/Email';
import { UserId } from '../value-objects/UserId';

export class User implements BaseEntity {
    constructor(
        public readonly id: string,
        public readonly userId: UserId,
        public readonly email: Email,
        public readonly name: string,
        public readonly isActive: boolean,
        public readonly createdAt: Date,
        public readonly updatedAt: Date,
        public readonly version: number
    ) {}

    static create(email: string, name: string): User {
        const userId = UserId.generate();
        const emailVo = Email.create(email);
        const now = new Date();

        return new User(userId.value, userId, emailVo, name, true, now, now, 1);
    }

    updateName(newName: string): User {
        return new User(
            this.id,
            this.userId,
            this.email,
            newName,
            this.isActive,
            this.createdAt,
            new Date(),
            this.version + 1
        );
    }

    deactivate(): User {
        return new User(
            this.id,
            this.userId,
            this.email,
            this.name,
            false,
            this.createdAt,
            new Date(),
            this.version + 1
        );
    }
}
```

## Package Naming Conventions

### Namespace Structure

- `@funkshan/shared-*` - Shared utilities and common code
- `@funkshan/core-*` - Core business domain packages
- `@funkshan/infra-*` - Infrastructure-related packages
- `@funkshan/integration-*` - External service integrations

### Examples

- `@funkshan/shared-types`
- `@funkshan/shared-errors`
- `@funkshan/shared-validation`
- `@funkshan/core-user-domain`
- `@funkshan/core-order-domain`
- `@funkshan/infra-database`
- `@funkshan/infra-messaging`
- `@funkshan/integration-payment`
- `@funkshan/integration-email`

## Package Dependencies Guidelines

### Dependency Rules

1. **Shared packages** can only depend on other shared packages
2. **Core domain packages** can depend on shared packages only
3. **Infrastructure packages** can depend on shared and core packages
4. **Integration packages** can depend on shared and infrastructure packages
5. **Applications** can depend on any package

### Dependency Graph

```
Applications
    ↓
Integration Packages
    ↓
Infrastructure Packages
    ↓
Core Domain Packages
    ↓
Shared Packages
```

## Testing Strategy

### Unit Tests

- Test individual functions and classes in isolation
- Mock external dependencies
- Aim for >90% code coverage

### Integration Tests

- Test package integration with other packages
- Test database interactions
- Test external service integrations

### Contract Tests

- Test package APIs and interfaces
- Ensure backward compatibility
- Validate package contracts

## Documentation Requirements

### README.md Template

````markdown
# @funkshan/[package-name]

Brief description of the package and its purpose.

## Installation

\```bash
pnpm add @funkshan/[package-name]
\```

## Usage

Basic usage examples.

\```typescript
import { ExampleClass } from '@funkshan/[package-name]';

const example = new ExampleClass();
example.doSomething();
\```

## API Reference

### Classes

#### ExampleClass

Description of the class.

##### Methods

- `doSomething()` - Description of the method

## Contributing

Guidelines for contributing to this package.

## License

MIT License
````

### API Documentation

- Document all public interfaces
- Provide usage examples
- Include migration guides for breaking changes

## Release Process

### Versioning

Follow semantic versioning (SemVer):

- **Major**: Breaking changes
- **Minor**: New features (backward compatible)
- **Patch**: Bug fixes (backward compatible)

### Release Steps

1. Update CHANGELOG.md
2. Run tests and ensure they pass
3. Update version in package.json
4. Create git tag
5. Publish to package registry
6. Update dependent packages

This guide ensures consistent package creation and maintenance across the Funkshan monorepo while following enterprise architecture principles.
