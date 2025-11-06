# Worker + Messaging Infrastructure

This document describes the background worker and messaging infrastructure created for the Funkshan application.

## 📦 Packages Created

### 1. `@funkshan/messaging` (packages/messaging/)

Core RabbitMQ messaging infrastructure providing:

- **RabbitMQConnection**: Connection manager with auto-reconnect
- **JobPublisher**: Publish messages to queues
- **Consumer**: Base class for creating message consumers
- **Types**: TypeScript interfaces for type-safe messaging

**Key Features:**

- ✅ Automatic reconnection on connection loss
- ✅ Configurable retry logic with dead letter queues
- ✅ Type-safe message definitions
- ✅ Singleton connection pattern
- ✅ Graceful shutdown handling
- ✅ Structured logging with Pino

**Dependencies:**

- `amqplib` (^0.10.9) - RabbitMQ client
- `pino` (^10.1.0) - Structured logging

### 2. `funkshan-worker` (apps/funkshan-worker/)

Background worker application for processing async jobs:

- **Consumer Management**: Start/stop multiple consumers
- **Graceful Shutdown**: Proper cleanup on SIGTERM/SIGINT
- **Example Consumer**: Template for creating new consumers
- **Configuration**: Environment-based config

**Key Features:**

- ✅ Multiple consumer support
- ✅ Shared database access via Prisma
- ✅ Error handling and logging
- ✅ Hot reload in development mode
- ✅ Process signal handling

## 🏗️ Architecture

```
┌──────────────────┐         ┌──────────────┐         ┌──────────────────┐
│                  │         │              │         │                  │
│  funkshan-api    │────────▶│  RabbitMQ    │────────▶│ funkshan-worker  │
│  (REST API)      │ publish │  (Queues)    │ consume │  (Background)    │
│                  │         │              │         │                  │
└──────────────────┘         └──────────────┘         └──────────────────┘
         │                                                      │
         │                                                      │
         ▼                                                      ▼
  ┌─────────────┐                                    ┌──────────────────┐
  │  Database   │◀───────────────────────────────────│  External APIs   │
  │ (Postgres)  │         Update status              │  - SMTP/SendGrid │
  └─────────────┘                                    │  - FCM/APNS      │
                                                     └──────────────────┘
```

## 🚀 Usage

### Running the Worker

```bash
# Development with hot-reload
pnpm dev:worker

# Production build
pnpm build:worker
pnpm start:worker

# Run all services (web, api, worker)
pnpm dev
```

### Environment Variables

Create `.env` file in `apps/funkshan-worker/`:

```env
# RabbitMQ
RABBITMQ_URL=amqp://localhost
RABBITMQ_EXCHANGE=funkshan_exchange

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/funkshan

# Worker Configuration
WORKER_CONCURRENCY=10
WORKER_RETRY_ATTEMPTS=3
WORKER_RETRY_DELAY=5000

# Logging
LOG_LEVEL=info
NODE_ENV=development
```

## 📝 Creating a New Consumer

### 1. Define Your Job Type

```typescript
// In your application code or packages/messaging/src/types.ts
export interface SendEmailJob extends BaseJob {
    type: 'SEND_EMAIL';
    userId: number;
    email: string;
    template: 'welcome' | 'verification';
    data: Record<string, any>;
}
```

### 2. Create Consumer Class

```typescript
// apps/funkshan-worker/src/consumers/email.consumer.ts
import { Consumer, MessageEnvelope } from '@funkshan/messaging';
import { SendEmailJob } from './types';

export class EmailConsumer extends Consumer<SendEmailJob> {
    async handleMessage(
        job: SendEmailJob,
        envelope: MessageEnvelope<SendEmailJob>
    ): Promise<void> {
        // Your business logic here
        console.log('Sending email to:', job.email);

        // Send email via SendGrid/SMTP
        // Update database
        // etc.
    }
}
```

### 3. Register in Worker

```typescript
// apps/funkshan-worker/src/index.ts
import { EmailConsumer } from './consumers/email.consumer';

// In startConsumers() method:
const emailConsumer = new EmailConsumer('email_queue', {
    prefetch: 5,
    retryAttempts: 3,
});
await emailConsumer.start();
this.consumers.push(emailConsumer);
```

### 4. Publish Jobs from API

```typescript
// apps/funkshan-api/src/services/UserService.ts
import { JobPublisher } from '@funkshan/messaging';

class UserService {
    private publisher = new JobPublisher();

    async registerUser(data: CreateUserData) {
        const user = await this.userRepository.createUser(data);

        // Publish email job
        await this.publisher.publish('email_queue', {
            type: 'SEND_EMAIL',
            userId: user.id,
            email: user.email,
            template: 'welcome',
            data: { firstName: user.firstName },
        });

        return user;
    }
}
```

## 🔧 Configuration

### Queue Definitions

Edit `packages/messaging/src/queues.ts`:

```typescript
export const QUEUES = {
    EMAIL: 'email_queue',
    PUSH_NOTIFICATION: 'push_notification_queue',
    // Add more queues...
} as const;
```

### Consumer Options

```typescript
{
    queueName: 'my_queue',           // Required
    routingKey: 'my_routing_key',    // Default: queueName
    durable: true,                    // Queue survives broker restart
    prefetch: 1,                      // Messages to fetch at once
    retryAttempts: 3,                 // Max retry attempts
    retryDelay: 5000,                 // Delay between retries (ms)
    deadLetterExchange: 'my.dlx',    // Dead letter exchange
    deadLetterRoutingKey: 'my.dlq',  // Dead letter routing key
}
```

## 📊 Monitoring

### Logs

All logs are structured JSON in production, pretty-printed in development:

```bash
# View worker logs
pnpm dev:worker

# In production, logs go to stdout (capture with your log aggregator)
```

### RabbitMQ Management UI

Access at: http://localhost:15672 (default: guest/guest)

- View queue depths
- Monitor message rates
- Check consumer connections
- Inspect dead letter queues

## 🛠️ Development

### Project Structure

```
packages/messaging/
├── src/
│   ├── connection.ts        # RabbitMQ connection manager
│   ├── publisher.ts         # Message publisher
│   ├── consumer.ts          # Base consumer class
│   ├── types.ts             # TypeScript interfaces
│   ├── queues.ts            # Queue definitions
│   └── index.ts             # Package exports
├── package.json
├── tsconfig.json
└── README.md

apps/funkshan-worker/
├── src/
│   ├── consumers/
│   │   ├── example.consumer.ts    # Example consumer
│   │   └── index.ts               # Consumer exports
│   ├── config/
│   │   ├── logger.ts              # Logger configuration
│   │   └── index.ts               # App configuration
│   └── index.ts                   # Worker entry point
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

### Build Commands

```bash
# Build messaging package
pnpm --filter @funkshan/messaging build

# Build worker
pnpm --filter funkshan-worker build

# Build all
pnpm build
```

## 📚 Next Steps

1. **Implement Email Consumer** - Send emails via SendGrid/SMTP
2. **Implement Push Notification Consumer** - Send push notifications via FCM/APNS
3. **Add Job Scheduling** - For periodic tasks
4. **Add Metrics** - Prometheus/Grafana integration
5. **Add Health Checks** - HTTP endpoint for monitoring
6. **Docker Compose** - Local development environment
7. **Tests** - Unit and integration tests

## 🔒 Production Considerations

- Run multiple worker instances for high availability
- Use process managers (PM2, systemd) or orchestration (Kubernetes)
- Set appropriate prefetch values based on job processing time
- Monitor queue depths and consumer lag
- Set up dead letter queue monitoring and alerting
- Implement circuit breakers for external API calls
- Use RabbitMQ clustering for high availability
- Secure RabbitMQ with proper authentication and TLS

---

**Created:** October 26, 2025
**Version:** 1.0.0
**RabbitMQ Version:** 4.1.4 (amqplib 0.10.9)
