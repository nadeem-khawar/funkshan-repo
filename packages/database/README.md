# @funkshan/database

Shared database models and repositories using Prisma ORM with PostgreSQL.

## Purpose

This package provides a centralized data access layer with Prisma models and repository pattern implementations that can be shared across multiple services.

## Features

- Prisma ORM for type-safe database access
- PostgreSQL database support
- Custom output path for Prisma Client (future-proof for Prisma ORM 7)
- Enhanced database connection utilities with production/development configs
- Connection health checks
- Transaction support
- Base repository interface and implementation
- Consistent data access patterns
- Type-safe database operations

## Setup

### Prerequisites

- PostgreSQL database server
- DATABASE_URL environment variable set

### Installation

```bash
# Install dependencies
pnpm install

# Generate Prisma Client
pnpm prisma:generate
```

## Usage

### Basic Connection

```typescript
import { connect, disconnect, isConnected } from '@funkshan/database';

// Connect to database (uses DATABASE_URL from environment)
await connect();

// Check connection status
if (isConnected()) {
    console.log('Database is connected');
}

// Disconnect
await disconnect();
```

### Production Configuration

```typescript
import { connect } from '@funkshan/database';

// Connect with production optimizations
await connect({
    isProduction: true, // Enables minimal error format, reduced logging
    datasourceUrl: process.env.DATABASE_URL,
    logging: false,
});
```

### Using Prisma Client

```typescript
import { getPrismaClient } from '@funkshan/database';

// Get the Prisma client instance
const prisma = getPrismaClient();

// Use Prisma client for database operations
const users = await prisma.user.findMany();
```

### Health Checks

```typescript
import { healthCheck } from '@funkshan/database';

// Perform health check
const health = await healthCheck();

if (health.status === 'healthy') {
    console.log('Database is healthy');
} else {
    console.error(`Database unhealthy: ${health.error}`);
}
```

### Transactions

```typescript
import { executeTransaction, getPrismaClient } from '@funkshan/database';

// Execute a transaction
const result = await executeTransaction(async tx => {
    const user = await tx.user.create({
        data: { email: 'user@example.com', name: 'John Doe' },
    });

    const profile = await tx.profile.create({
        data: { userId: user.id, bio: 'Hello world' },
    });

    return { user, profile };
});
```

## Prisma Commands

```bash
# Generate Prisma Client
pnpm prisma:generate

# Create a migration
pnpm prisma:migrate

# Deploy migrations (production)
pnpm prisma:migrate:deploy

# Open Prisma Studio (database GUI)
pnpm prisma:studio

# Seed the database
pnpm prisma:seed
```

## Schema

The Prisma schema is located at `prisma/schema.prisma`. Add your models here:

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  role      String   @default("user")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

After updating the schema:

1. Generate the client: `pnpm prisma:generate`
2. Create a migration: `pnpm prisma:migrate`

## Environment Variables

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/dbname?schema=public"
```

## Repository Pattern

Extend the base repository for your entities:

```typescript
import { BaseRepository } from '@funkshan/database';

class UserRepository extends BaseRepository<User> {
    // Add custom repository methods
}
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

## Migration from MongoDB/Mongoose

If migrating from the previous MongoDB/Mongoose implementation:

1. Update connection calls to remove `uri` parameter (use `datasourceUrl` in config)
2. Replace `getMongoose()` and `getConnection()` with `getPrismaClient()`
3. Replace Mongoose models with Prisma models
4. Update queries to use Prisma Client API

## Learn More

- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma Client API Reference](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
