# funkshan-worker

Background worker service for processing asynchronous jobs from RabbitMQ queues.

## Overview

This worker application consumes messages from RabbitMQ queues and processes background tasks such as:

- 📧 Sending emails
- 📱 Sending push notifications
- 🔄 Processing async operations
- 📊 Generating reports
- 🗄️ Data processing tasks

## Features

- ✅ Consumes jobs from multiple RabbitMQ queues
- ✅ Automatic retry with exponential backoff
- ✅ Dead letter queue for failed jobs
- ✅ Graceful shutdown handling
- ✅ Shared database access via Prisma
- ✅ Type-safe message contracts
- ✅ Structured logging

## Architecture

```
RabbitMQ Queues → Worker Consumers → External Services
                        ↓
                    Database
```

## Development

```bash
# Install dependencies
pnpm install

# Development mode with auto-reload
pnpm dev

# Build
pnpm build

# Production
pnpm start
```

## Environment Variables

Create a `.env` file:

```env
# RabbitMQ
RABBITMQ_URL=amqp://localhost
RABBITMQ_EXCHANGE=funkshan_exchange

# Database (shared with API)
DATABASE_URL=postgresql://user:password@localhost:5432/funkshan

# Logging
LOG_LEVEL=info
NODE_ENV=development
```

## Adding New Consumers

1. Create a new consumer in `src/consumers/`
2. Extend the base `Consumer` class from `@funkshan/messaging`
3. Implement the `handleMessage` method
4. Register in `src/index.ts`

Example:

```typescript
import { Consumer } from '@funkshan/messaging';

export class MyConsumer extends Consumer<MyJobType> {
    async handleMessage(job: MyJobType) {
        // Process the job
        console.log('Processing:', job);
    }
}
```

## Deployment

The worker can be deployed as:

- Standalone Node.js process
- Docker container
- Kubernetes pod
- Systemd service

Scale horizontally by running multiple worker instances.
