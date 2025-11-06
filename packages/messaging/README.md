# @funkshan/messaging

Shared RabbitMQ messaging infrastructure for queue-based communication between services.

## Features

- 🔌 RabbitMQ connection management with automatic reconnection
- 📨 Publisher for sending messages to queues
- 🎧 Consumer base class for processing messages
- 🔄 Automatic retry logic with dead letter queues
- 📝 Type-safe message definitions
- 🛡️ Error handling and graceful shutdown

## Usage

### Publishing Messages

```typescript
import { JobPublisher } from '@funkshan/messaging';

const publisher = new JobPublisher();
await publisher.connect();

await publisher.publish({
    type: 'SEND_EMAIL',
    email: 'user@example.com',
    template: 'welcome',
});
```

### Consuming Messages

```typescript
import { Consumer } from '@funkshan/messaging';

class EmailConsumer extends Consumer {
    async handleMessage(job: any): Promise<void> {
        // Process the message
        console.log('Processing job:', job);
    }
}

const consumer = new EmailConsumer('email_queue');
await consumer.start();
```

## Configuration

Set the following environment variables:

- `RABBITMQ_URL` - RabbitMQ connection URL (default: `amqp://localhost`)
- `RABBITMQ_EXCHANGE` - Exchange name (default: `funkshan_exchange`)
