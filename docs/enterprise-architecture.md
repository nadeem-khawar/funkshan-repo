# Enterprise API Architecture Guide

## Table of Contents

- [Overview](#overview)
- [Core Principles](#core-principles)
- [Architecture Patterns](#architecture-patterns)
- [Project Structure](#project-structure)
- [Package Organization](#package-organization)
- [SOLID Principles Implementation](#solid-principles-implementation)
- [Scalability & Microservices Strategy](#scalability--microservices-strategy)
- [Best Practices](#best-practices)
- [Implementation Examples](#implementation-examples)

## Overview

This document outlines the architecture and design patterns for building a scalable, maintainable enterprise API using Node.js, TypeScript, and Fastify. The architecture is designed to:

- Follow SOLID principles
- Support modular development
- Enable future microservices migration
- Maximize code reusability through packages
- Maintain separation of concerns
- Support enterprise-scale applications

## Core Principles

### 1. Domain-Driven Design (DDD)

- Organize code around business domains
- Clear boundaries between different business contexts
- Ubiquitous language throughout the codebase

### 2. Hexagonal Architecture (Ports & Adapters)

- Business logic isolated from external concerns
- Dependency inversion for all external dependencies
- Testable and framework-agnostic core

### 3. SOLID Principles

- **S**ingle Responsibility Principle
- **O**pen/Closed Principle
- **L**iskov Substitution Principle
- **I**nterface Segregation Principle
- **D**ependency Inversion Principle

### 4. Package-First Architecture

- Maximize code reuse through shared packages
- Clear API boundaries between packages
- Independent versioning and deployment

## Architecture Patterns

### Layered Architecture

```
┌─────────────────────────────────────┐
│           API Layer                 │  ← Controllers, Routes, Middleware
├─────────────────────────────────────┤
│        Application Layer            │  ← Use Cases, Application Services
├─────────────────────────────────────┤
│          Domain Layer               │  ← Entities, Value Objects, Domain Services
├─────────────────────────────────────┤
│       Infrastructure Layer          │  ← Database, External APIs, File System
└─────────────────────────────────────┘
```

### Package Dependencies Flow

```
API Layer ──→ Application Layer ──→ Domain Layer
    │              │                     ↑
    │              └─────────────────────┤
    └─────→ Infrastructure Layer ────────┘
```

## Project Structure

### Monorepo Structure

```
funkshan-repo/
├── apps/
│   ├── funkshan-api/              # Main API application
│   ├── funkshan-web/              # Frontend application
│   └── funkshan-admin/            # Admin dashboard (future)
├── packages/
│   ├── core/                      # Core business logic
│   │   ├── domain/                # Domain entities and services
│   │   ├── application/           # Use cases and application services
│   │   └── infrastructure/        # Infrastructure implementations
│   ├── shared/                    # Shared utilities and types
│   │   ├── types/                 # Common TypeScript types
│   │   ├── utils/                 # Utility functions
│   │   ├── validation/            # Validation schemas
│   │   └── errors/                # Error handling
│   ├── database/                  # Database-related packages
│   │   ├── models/                # Mongoose models
│   │   ├── repositories/          # Repository implementations
│   │   └── migrations/            # Database migrations
│   ├── auth/                      # Authentication & authorization
│   │   ├── core/                  # Auth domain logic
│   │   ├── jwt/                   # JWT implementation
│   │   └── rbac/                  # Role-based access control
│   ├── notifications/             # Notification services
│   │   ├── email/                 # Email notifications
│   │   ├── sms/                   # SMS notifications
│   │   └── push/                  # Push notifications
│   └── integrations/              # External service integrations
│       ├── payment/               # Payment gateway integrations
│       ├── storage/               # File storage services
│       └── analytics/             # Analytics services
├── docs/                          # Documentation
├── tools/                         # Build tools and scripts
└── configs/                       # Shared configurations
```

### API Application Structure

```
apps/funkshan-api/
├── src/
│   ├── api/                       # API layer
│   │   ├── controllers/           # HTTP controllers
│   │   ├── routes/                # Route definitions
│   │   ├── middleware/            # API-specific middleware
│   │   └── validators/            # Request/response validation
│   ├── application/               # Application layer
│   │   ├── use-cases/             # Business use cases
│   │   ├── services/              # Application services
│   │   └── dtos/                  # Data transfer objects
│   ├── domain/                    # Domain layer
│   │   ├── entities/              # Domain entities
│   │   ├── value-objects/         # Value objects
│   │   ├── services/              # Domain services
│   │   ├── repositories/          # Repository interfaces
│   │   └── events/                # Domain events
│   ├── infrastructure/            # Infrastructure layer
│   │   ├── database/              # Database implementations
│   │   ├── external/              # External service clients
│   │   ├── messaging/             # Message queue implementations
│   │   └── storage/               # File storage implementations
│   ├── plugins/                   # Fastify plugins
│   ├── config/                    # Configuration
│   └── types/                     # Application-specific types
├── tests/
│   ├── unit/                      # Unit tests
│   ├── integration/               # Integration tests
│   └── e2e/                       # End-to-end tests
└── docs/                          # API documentation
```

## Package Organization

### Core Domain Package Structure

```
packages/core/
├── domain/
│   ├── entities/
│   │   ├── User.ts
│   │   ├── Product.ts
│   │   └── Order.ts
│   ├── value-objects/
│   │   ├── Email.ts
│   │   ├── Money.ts
│   │   └── UserId.ts
│   ├── services/
│   │   ├── UserService.ts
│   │   └── OrderService.ts
│   ├── repositories/
│   │   ├── IUserRepository.ts
│   │   └── IOrderRepository.ts
│   └── events/
│       ├── UserCreated.ts
│       └── OrderPlaced.ts
├── application/
│   ├── use-cases/
│   │   ├── CreateUser.ts
│   │   ├── PlaceOrder.ts
│   │   └── GetUserProfile.ts
│   ├── services/
│   │   ├── UserApplicationService.ts
│   │   └── OrderApplicationService.ts
│   └── dtos/
│       ├── CreateUserDto.ts
│       └── PlaceOrderDto.ts
└── infrastructure/
    ├── repositories/
    │   ├── MongoUserRepository.ts
    │   └── MongoOrderRepository.ts
    └── external/
        ├── PaymentGatewayClient.ts
        └── EmailServiceClient.ts
```

### Shared Packages

#### Types Package

```typescript
// packages/shared/types/src/common.ts
export interface BaseEntity {
    id: string;
    createdAt: Date;
    updatedAt: Date;
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
}
```

#### Error Handling Package

```typescript
// packages/shared/errors/src/AppError.ts
export abstract class AppError extends Error {
    abstract readonly statusCode: number;
    abstract readonly errorCode: string;

    constructor(
        message: string,
        public readonly cause?: Error
    ) {
        super(message);
        this.name = this.constructor.name;
    }
}

export class ValidationError extends AppError {
    readonly statusCode = 400;
    readonly errorCode = 'VALIDATION_ERROR';
}

export class NotFoundError extends AppError {
    readonly statusCode = 404;
    readonly errorCode = 'NOT_FOUND';
}
```

#### Repository Pattern Package

```typescript
// packages/shared/repository/src/IRepository.ts
export interface IRepository<T, ID> {
    findById(id: ID): Promise<T | null>;
    findAll(options?: PaginationOptions): Promise<PaginatedResult<T>>;
    save(entity: T): Promise<T>;
    update(id: ID, updates: Partial<T>): Promise<T>;
    delete(id: ID): Promise<void>;
}

// packages/shared/repository/src/BaseRepository.ts
export abstract class BaseRepository<T, ID> implements IRepository<T, ID> {
    abstract findById(id: ID): Promise<T | null>;
    abstract findAll(options?: PaginationOptions): Promise<PaginatedResult<T>>;
    abstract save(entity: T): Promise<T>;
    abstract update(id: ID, updates: Partial<T>): Promise<T>;
    abstract delete(id: ID): Promise<void>;

    protected validateEntity(entity: T): void {
        // Common validation logic
    }
}
```

## SOLID Principles Implementation

### Single Responsibility Principle (SRP)

Each class/module has one reason to change:

```typescript
// ❌ Bad: Multiple responsibilities
class UserController {
    async createUser(request: FastifyRequest) {
        // Validation logic
        const { email, name } = request.body;
        if (!email || !name) throw new Error('Invalid input');

        // Business logic
        const user = new User(email, name);

        // Database logic
        await mongoose.connect('mongodb://...');
        await user.save();

        // Email logic
        await sendEmail(email, 'Welcome!');

        return user;
    }
}

// ✅ Good: Single responsibility
class UserController {
    constructor(private createUserUseCase: CreateUserUseCase) {}

    async createUser(request: FastifyRequest) {
        const dto = CreateUserDto.fromRequest(request);
        const user = await this.createUserUseCase.execute(dto);
        return UserResponse.fromEntity(user);
    }
}
```

### Open/Closed Principle (OCP)

Open for extension, closed for modification:

```typescript
// ✅ Good: Extensible notification system
interface INotificationService {
    send(message: string, recipient: string): Promise<void>;
}

class EmailNotificationService implements INotificationService {
    async send(message: string, recipient: string): Promise<void> {
        // Email implementation
    }
}

class SMSNotificationService implements INotificationService {
    async send(message: string, recipient: string): Promise<void> {
        // SMS implementation
    }
}

class NotificationManager {
    constructor(private services: INotificationService[]) {}

    async sendToAll(message: string, recipient: string): Promise<void> {
        await Promise.all(
            this.services.map(service => service.send(message, recipient))
        );
    }
}
```

### Liskov Substitution Principle (LSP)

Derived classes must be substitutable for their base classes:

```typescript
// ✅ Good: Proper inheritance
abstract class PaymentProcessor {
    abstract processPayment(
        amount: number,
        currency: string
    ): Promise<PaymentResult>;

    protected validateAmount(amount: number): void {
        if (amount <= 0) throw new Error('Invalid amount');
    }
}

class StripePaymentProcessor extends PaymentProcessor {
    async processPayment(
        amount: number,
        currency: string
    ): Promise<PaymentResult> {
        this.validateAmount(amount);
        // Stripe-specific implementation
        return new PaymentResult('success', 'stripe_transaction_id');
    }
}

class PayPalPaymentProcessor extends PaymentProcessor {
    async processPayment(
        amount: number,
        currency: string
    ): Promise<PaymentResult> {
        this.validateAmount(amount);
        // PayPal-specific implementation
        return new PaymentResult('success', 'paypal_transaction_id');
    }
}
```

### Interface Segregation Principle (ISP)

Clients should not depend on interfaces they don't use:

```typescript
// ❌ Bad: Fat interface
interface IUserService {
    createUser(data: CreateUserData): Promise<User>;
    updateUser(id: string, data: UpdateUserData): Promise<User>;
    deleteUser(id: string): Promise<void>;
    sendWelcomeEmail(userId: string): Promise<void>;
    generateReport(userId: string): Promise<Report>;
    exportUserData(userId: string): Promise<Buffer>;
}

// ✅ Good: Segregated interfaces
interface IUserCrudService {
    createUser(data: CreateUserData): Promise<User>;
    updateUser(id: string, data: UpdateUserData): Promise<User>;
    deleteUser(id: string): Promise<void>;
}

interface IUserNotificationService {
    sendWelcomeEmail(userId: string): Promise<void>;
}

interface IUserReportService {
    generateReport(userId: string): Promise<Report>;
    exportUserData(userId: string): Promise<Buffer>;
}
```

### Dependency Inversion Principle (DIP)

Depend on abstractions, not concretions:

```typescript
// ✅ Good: Dependency inversion
interface IUserRepository {
    findById(id: string): Promise<User | null>;
    save(user: User): Promise<User>;
}

interface IEmailService {
    sendEmail(to: string, subject: string, body: string): Promise<void>;
}

class CreateUserUseCase {
    constructor(
        private userRepository: IUserRepository,
        private emailService: IEmailService
    ) {}

    async execute(dto: CreateUserDto): Promise<User> {
        const user = User.create(dto.email, dto.name);
        const savedUser = await this.userRepository.save(user);
        await this.emailService.sendEmail(
            user.email,
            'Welcome!',
            'Welcome to our platform!'
        );
        return savedUser;
    }
}
```

## Scalability & Microservices Strategy

### Phase 1: Monolithic Modular Architecture

Start with a well-structured monolith organized by domains:

```
apps/funkshan-api/
├── src/
│   ├── modules/
│   │   ├── users/
│   │   │   ├── api/
│   │   │   ├── application/
│   │   │   ├── domain/
│   │   │   └── infrastructure/
│   │   ├── orders/
│   │   │   ├── api/
│   │   │   ├── application/
│   │   │   ├── domain/
│   │   │   └── infrastructure/
│   │   └── products/
│   │       ├── api/
│   │       ├── application/
│   │       ├── domain/
│   │       └── infrastructure/
```

### Phase 2: Extract to Packages

Move domain logic to shared packages:

```
packages/
├── user-management/
├── order-management/
├── product-catalog/
└── payment-processing/
```

### Phase 3: Microservices Migration

Extract packages to independent services:

```
services/
├── user-service/
├── order-service/
├── product-service/
└── payment-service/
```

### Migration Strategy

1. **Identify Bounded Contexts**: Group related functionality
2. **Extract Data Layer**: Move to dedicated database per service
3. **Implement Event-Driven Communication**: Use events for inter-service communication
4. **API Gateway**: Centralize routing and cross-cutting concerns
5. **Service Discovery**: Implement service registry and discovery

## Best Practices

### 1. Dependency Injection

```typescript
// Container configuration
class Container {
    private instances = new Map();

    register<T>(token: string, factory: () => T): void {
        this.instances.set(token, factory);
    }

    resolve<T>(token: string): T {
        const factory = this.instances.get(token);
        if (!factory) throw new Error(`Service ${token} not found`);
        return factory();
    }
}

// Usage
container.register('IUserRepository', () => new MongoUserRepository());
container.register('IEmailService', () => new SendGridEmailService());
container.register(
    'CreateUserUseCase',
    () =>
        new CreateUserUseCase(
            container.resolve('IUserRepository'),
            container.resolve('IEmailService')
        )
);
```

### 2. Event-Driven Architecture

```typescript
// Domain events
export class UserCreatedEvent {
    constructor(
        public readonly userId: string,
        public readonly email: string,
        public readonly occurredAt: Date = new Date()
    ) {}
}

// Event handler
export class UserCreatedHandler {
    constructor(private emailService: IEmailService) {}

    async handle(event: UserCreatedEvent): Promise<void> {
        await this.emailService.sendWelcomeEmail(event.email);
    }
}

// Event bus
export class EventBus {
    private handlers = new Map<string, any[]>();

    subscribe<T>(
        eventType: new (...args: any[]) => T,
        handler: (event: T) => Promise<void>
    ): void {
        const eventName = eventType.name;
        if (!this.handlers.has(eventName)) {
            this.handlers.set(eventName, []);
        }
        this.handlers.get(eventName)!.push(handler);
    }

    async publish<T>(event: T): Promise<void> {
        const eventName = event.constructor.name;
        const handlers = this.handlers.get(eventName) || [];
        await Promise.all(handlers.map(handler => handler(event)));
    }
}
```

### 3. Configuration Management

```typescript
// packages/shared/config/src/index.ts
export interface DatabaseConfig {
    url: string;
    poolSize: number;
    ssl: boolean;
}

export interface AppConfig {
    port: number;
    database: DatabaseConfig;
    jwt: {
        secret: string;
        expiresIn: string;
    };
    email: {
        apiKey: string;
        from: string;
    };
}

export class ConfigService {
    private config: AppConfig;

    constructor() {
        this.config = this.loadConfig();
    }

    private loadConfig(): AppConfig {
        return {
            port: Number(process.env.PORT) || 3001,
            database: {
                url:
                    process.env.MONGODB_URL ||
                    'mongodb://localhost:27017/funkshan',
                poolSize: Number(process.env.DB_POOL_SIZE) || 10,
                ssl: process.env.DB_SSL === 'true',
            },
            jwt: {
                secret: process.env.JWT_SECRET || 'dev-secret',
                expiresIn: process.env.JWT_EXPIRES_IN || '24h',
            },
            email: {
                apiKey: process.env.EMAIL_API_KEY || '',
                from: process.env.EMAIL_FROM || 'noreply@funkshan.com',
            },
        };
    }

    get<K extends keyof AppConfig>(key: K): AppConfig[K] {
        return this.config[key];
    }
}
```

### 4. Testing Strategy

```typescript
// Unit test example
describe('CreateUserUseCase', () => {
    let useCase: CreateUserUseCase;
    let userRepository: jest.Mocked<IUserRepository>;
    let emailService: jest.Mocked<IEmailService>;

    beforeEach(() => {
        userRepository = {
            save: jest.fn(),
            findById: jest.fn(),
        };
        emailService = {
            sendEmail: jest.fn(),
        };

        useCase = new CreateUserUseCase(userRepository, emailService);
    });

    it('should create user and send welcome email', async () => {
        // Arrange
        const dto = new CreateUserDto('test@example.com', 'Test User');
        const user = User.create(dto.email, dto.name);
        userRepository.save.mockResolvedValue(user);

        // Act
        const result = await useCase.execute(dto);

        // Assert
        expect(userRepository.save).toHaveBeenCalledWith(expect.any(User));
        expect(emailService.sendEmail).toHaveBeenCalledWith(
            'test@example.com',
            'Welcome!',
            'Welcome to our platform!'
        );
        expect(result).toEqual(user);
    });
});
```

## Implementation Examples

### Complete Use Case Implementation

```typescript
// Domain Entity
export class User {
    private constructor(
        public readonly id: UserId,
        public readonly email: Email,
        public readonly name: string,
        public readonly createdAt: Date
    ) {}

    static create(email: string, name: string): User {
        return new User(
            UserId.generate(),
            Email.create(email),
            name,
            new Date()
        );
    }

    updateName(newName: string): User {
        return new User(this.id, this.email, newName, this.createdAt);
    }
}

// Application Use Case
export class CreateUserUseCase {
    constructor(
        private userRepository: IUserRepository,
        private emailService: IEmailService,
        private eventBus: IEventBus
    ) {}

    async execute(dto: CreateUserDto): Promise<UserResponseDto> {
        // Validate business rules
        const existingUser = await this.userRepository.findByEmail(dto.email);
        if (existingUser) {
            throw new ValidationError('User with this email already exists');
        }

        // Create domain entity
        const user = User.create(dto.email, dto.name);

        // Persist entity
        const savedUser = await this.userRepository.save(user);

        // Publish domain event
        await this.eventBus.publish(
            new UserCreatedEvent(savedUser.id.value, savedUser.email.value)
        );

        return UserResponseDto.fromEntity(savedUser);
    }
}

// API Controller
export class UserController {
    constructor(private createUserUseCase: CreateUserUseCase) {}

    async createUser(
        request: FastifyRequest,
        reply: FastifyReply
    ): Promise<void> {
        try {
            const dto = CreateUserDto.fromRequest(request);
            const result = await this.createUserUseCase.execute(dto);
            reply.status(201).send(result);
        } catch (error) {
            if (error instanceof ValidationError) {
                reply.status(400).send({ error: error.message });
            } else {
                reply.status(500).send({ error: 'Internal server error' });
            }
        }
    }
}
```

This architecture provides a solid foundation for building enterprise-scale applications that can evolve from a modular monolith to microservices while maintaining clean code principles and high testability.
