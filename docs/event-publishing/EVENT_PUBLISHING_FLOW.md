# Event Publishing and Notification Flow

## Overview

This document describes the architecture and flow for publishing events and sending notifications to guests when an event is created with `isDraft = false`.

## Architecture

```
┌─────────────────┐
│   funkshan-api  │
│                 │
│  POST /events   │
└────────┬────────┘
         │
         │ 1. Save event to DB
         │    (with guests)
         │
         ├─────────────────────────────────┐
         │                                 │
         │ isDraft = false?                │
         │                                 │
         ├─────YES────────┐                │
         │                │                │
         │ 2. Publish     │                │
         │    message     │                │
         │    to RabbitMQ │                │
         │                │                │
         ▼                ▼                │
   ┌──────────────────────────┐           │
   │      RabbitMQ            │           │
   │                          │           │
   │  Queue: event.published  │           │
   └────────┬─────────────────┘           │
            │                             │
            │ 3. Consume message          │
            │                             │
            ▼                             │
   ┌────────────────────┐                 │
   │  funkshan-worker   │                 │
   │                    │                 │
   │  Event Processor   │                 │
   └────────┬───────────┘                 │
            │                             │
            │ 4. Fetch event details      │
            │    with guests from DB      │
            │                             │
            ▼                             │
   ┌────────────────────┐                 │
   │  Notification      │                 │
   │  Service           │                 │
   │                    │                 │
   │  - Email sender    │                 │
   │  - SMS sender      │                 │
   │  - Push notif      │                 │
   └────────────────────┘                 │
                                          │
         NO ──────────────────────────────┘
         │
         │ Return response
         │ (Draft saved)
         ▼
```

## Detailed Flow

### 1. Event Creation (API)

**Endpoint:** `POST /api/v1/events`

**Process:**

1. Validate request data
2. Create event with guests in database (transaction)
3. Generate QR code and/or PIN code if needed
4. Check `isDraft` flag
5. If `isDraft = false`:
    - Publish message to RabbitMQ queue
    - Update event `publishedAt` timestamp
6. Return event response to client

**Database Transaction:**

```typescript
// Pseudocode
await prisma.$transaction(async (tx) => {
  // 1. Create event
  const event = await tx.event.create({...});

  // 2. Create guests
  await tx.guest.createMany({...});

  // 3. Create checkin agents
  await tx.eventCheckinAgent.createMany({...});

  // 4. If not draft, update publishedAt
  if (!isDraft) {
    await tx.event.update({
      where: { id: event.id },
      data: { publishedAt: new Date() }
    });
  }
});

// 5. After transaction succeeds, publish message
if (!isDraft) {
  await publishEventCreated(event.id);
}
```

### 2. Message Queue (RabbitMQ)

**Queue Name:** `event.published`

**Message Format:**

```json
{
    "eventId": "clx123...",
    "userId": "clx456...",
    "eventName": "Birthday Party",
    "eventDateTime": "2026-01-15T19:00:00Z",
    "guestCount": 25,
    "timestamp": "2026-01-08T20:00:00Z"
}
```

**Queue Configuration:**

```typescript
{
  durable: true,        // Queue survives broker restart
  autoDelete: false,    // Queue persists even when no consumers
  deadLetterExchange: "dlx.event",  // For failed messages
  messageTtl: 86400000, // 24 hours
  maxPriority: 10       // Support priority messages
}
```

### 3. Worker Processing

**Worker:** `funkshan-worker`

**Consumer Configuration:**

- Prefetch: 1 (process one message at a time)
- Manual acknowledgment
- Retry on failure

**Processing Steps:**

```typescript
// 1. Consume message from queue
consumer.on('message', async message => {
    try {
        // 2. Fetch complete event with guests
        const event = await prisma.event.findUnique({
            where: { id: message.eventId },
            include: {
                user: true,
                guests: {
                    where: {
                        inviteStatus: 'PENDING',
                    },
                },
            },
        });

        // 3. Validate event exists and is published
        if (!event || event.isDraft) {
            await message.ack(); // Acknowledge and skip
            return;
        }

        // 4. Process each guest
        for (const guest of event.guests) {
            await sendInvitation(event, guest);

            // Update guest status
            await prisma.guest.update({
                where: { id: guest.id },
                data: {
                    inviteStatus: 'SENT',
                    inviteSentAt: new Date(),
                },
            });
        }

        // 5. Acknowledge message
        await message.ack();
    } catch (error) {
        // Handle error (see error handling section)
        await handleProcessingError(message, error);
    }
});
```

### 4. Notification Service

**Services to Implement:**

#### Email Service

- Send invitation email with event details
- Include QR code/PIN code for entry
- Add calendar invite (.ics file)
- RSVP links (accept/reject)

**Email Template:**

```
Subject: You're invited to {eventName}!

Hi {guestName},

You're invited to {eventName} by {hostName}!

📅 Date: {dateTime in guest's timezone}
📍 Location: {venueAddress}
👔 Dress Code: {dressCode}

[View Event Details] [Accept] [Decline]

Entry Code: {qrCode or pinCode}
```

#### SMS Service (Optional)

- Send SMS notification
- Include short link to event details
- Entry code

#### Push Notification (Future)

- Mobile app notifications
- Real-time updates

### 5. Secure RSVP Token Implementation

#### Overview

To protect against unauthorized access and ensure secure RSVP functionality, each guest receives a unique, time-limited token. This token is independent of event details, allowing events to be updated without invalidating or complicating token management.

#### Design Principles

1. **Simplicity First:** Token is a random string stored in database, not a JWT
2. **Event-Independent:** Token doesn't encode event data (time, location, etc.)
3. **Time-Limited:** Token has its own expiration, separate from event datetime
4. **Update-Friendly:** Event changes don't affect token validity
5. **Single-Use Context:** Token can be used multiple times until expiration (for viewing/updating RSVP)

#### Database Schema

```prisma
model Guest {
  // ... existing fields
  rsvpToken          String?   @unique  // Unique secure token
  rsvpTokenExpiresAt DateTime?           // Token expiration
  // ... other fields

  @@index([rsvpToken])
}
```

#### Token Generation Strategy

**When to Generate:**

- When event is published (`isDraft = false`)
- Before sending invitation to guest

**Token Properties:**

```typescript
interface RsvpToken {
    token: string; // 32-character random string (crypto-safe)
    expiresAt: Date; // 30 days from generation
}
```

**Generation Implementation:**

```typescript
import { randomBytes } from 'crypto';

function generateRsvpToken(): string {
    // Generate 24 random bytes, convert to base64url (32 chars)
    return randomBytes(24)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

function calculateTokenExpiration(): Date {
    // Token valid for 30 days from generation
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    return expiresAt;
}

// Usage in worker when sending invitations
async function sendInvitation(event: Event, guest: Guest) {
    // Generate token if not exists
    if (!guest.rsvpToken) {
        const token = generateRsvpToken();
        const expiresAt = calculateTokenExpiration();

        await prisma.guest.update({
            where: { id: guest.id },
            data: {
                rsvpToken: token,
                rsvpTokenExpiresAt: expiresAt,
            },
        });

        guest.rsvpToken = token;
        guest.rsvpTokenExpiresAt = expiresAt;
    }

    // Build RSVP URLs
    const rsvpBaseUrl = `${process.env.WEB_APP_URL}/rsvp/${guest.rsvpToken}`;
    const acceptUrl = `${rsvpBaseUrl}?action=accept`;
    const declineUrl = `${rsvpBaseUrl}?action=decline`;

    // Send email with RSVP links
    await sendEmail({
        to: guest.email,
        subject: `You're invited to ${event.name}`,
        template: 'event-invitation',
        data: {
            guestName: guest.name,
            eventName: event.name,
            rsvpUrl: rsvpBaseUrl,
            acceptUrl: acceptUrl,
            declineUrl: declineUrl,
            // ... other event details
        },
    });
}
```

#### RSVP Endpoint Implementation

**Endpoint:** `GET /api/v1/rsvp/:token`

**Purpose:** Fetch event details for guest using secure token

```typescript
// Route handler
async function getRsvpDetails(request: FastifyRequest, reply: FastifyReply) {
    const { token } = request.params as { token: string };

    // 1. Find guest by token
    const guest = await prisma.guest.findUnique({
        where: { rsvpToken: token },
        include: {
            event: {
                include: {
                    user: {
                        select: { firstName: true, lastName: true },
                    },
                },
            },
        },
    });

    // 2. Validate token exists
    if (!guest) {
        return reply.status(404).send({
            error: 'Invalid RSVP link',
        });
    }

    // 3. Check token expiration
    if (guest.rsvpTokenExpiresAt && guest.rsvpTokenExpiresAt < new Date()) {
        return reply.status(410).send({
            error: 'This RSVP link has expired',
            message: 'Please contact the event host for a new invitation',
        });
    }

    // 4. Check if event is still active
    if (!guest.event.isActive) {
        return reply.status(404).send({
            error: 'Event no longer available',
        });
    }

    // 5. Return event details
    return reply.send({
        guest: {
            id: guest.id,
            name: guest.name,
            inviteType: guest.inviteType,
            inviteStatus: guest.inviteStatus,
        },
        event: {
            name: guest.event.name,
            dateTime: guest.event.dateTime,
            venueAddress: guest.event.venueAddress,
            venueTimezone: guest.event.venueTimezone,
            dressCode: guest.event.dressCode,
            details: guest.event.details,
            hostName: `${guest.event.user.firstName} ${guest.event.user.lastName}`,
        },
    });
}
```

**Endpoint:** `POST /api/v1/rsvp/:token/respond`

**Purpose:** Update guest RSVP status

```typescript
async function respondToRsvp(request: FastifyRequest, reply: FastifyReply) {
    const { token } = request.params as { token: string };
    const { status } = request.body as {
        status: 'ACCEPTED' | 'REJECTED' | 'MAYBE';
    };

    // 1. Validate token (same as getRsvpDetails)
    const guest = await prisma.guest.findUnique({
        where: { rsvpToken: token },
    });

    if (
        !guest ||
        !guest.rsvpTokenExpiresAt ||
        guest.rsvpTokenExpiresAt < new Date()
    ) {
        return reply
            .status(410)
            .send({ error: 'Invalid or expired RSVP link' });
    }

    // 2. Update guest status
    await prisma.guest.update({
        where: { id: guest.id },
        data: {
            inviteStatus: status,
            inviteRespondedAt: new Date(),
        },
    });

    return reply.send({
        success: true,
        message: `Your response has been recorded`,
    });
}
```

#### Handling Event Updates

**Scenario:** Host updates event time/location after invites sent

**Approach:** Tokens remain valid, send update notification

```typescript
async function updateEvent(eventId: string, updates: EventUpdate) {
    // 1. Update event
    const event = await prisma.event.update({
        where: { id: eventId },
        data: updates,
    });

    // 2. If event already published and significant change
    if (!event.isDraft && (updates.dateTime || updates.venueAddress)) {
        // Fetch guests with valid tokens
        const guests = await prisma.guest.findMany({
            where: {
                eventId: eventId,
                inviteStatus: { in: ['SENT', 'ACCEPTED', 'MAYBE'] },
                rsvpToken: { not: null },
                rsvpTokenExpiresAt: { gte: new Date() },
            },
        });

        // 3. Publish update notification message
        await publishEventUpdated({
            eventId: event.id,
            guestIds: guests.map(g => g.id),
            changedFields: Object.keys(updates),
        });

        // Worker will send update emails using existing tokens
    }

    return event;
}
```

#### Token Refresh Strategy

**When to Refresh:**

- When token is within 7 days of expiration
- Guest is viewing RSVP page

```typescript
async function refreshTokenIfNeeded(guest: Guest): Promise<Guest> {
    if (!guest.rsvpTokenExpiresAt) return guest;

    const daysUntilExpiry = Math.floor(
        (guest.rsvpTokenExpiresAt.getTime() - Date.now()) /
            (1000 * 60 * 60 * 24)
    );

    // Refresh if < 7 days remaining
    if (daysUntilExpiry < 7) {
        const newExpiration = calculateTokenExpiration();

        return await prisma.guest.update({
            where: { id: guest.id },
            data: { rsvpTokenExpiresAt: newExpiration },
        });
    }

    return guest;
}
```

#### Security Benefits

1. **No Event Data in Token:** Event updates don't break tokens
2. **Database Validation:** Can revoke tokens by deleting/nullifying
3. **Time-Limited:** Reduces window for unauthorized access
4. **Unique Per Guest:** One token cannot access another guest's RSVP
5. **Crypto-Safe Random:** 128 bits of entropy (24 bytes)
6. **URL-Safe:** Base64URL encoding prevents URL encoding issues

#### Token Expiration Policy

**Default:** 30 days from generation

**Configurable per event type:**

```typescript
const TOKEN_EXPIRATION_DAYS = {
    default: 30,
    wedding: 60, // Longer planning time
    birthday: 21, // Standard
    corporate: 14, // Shorter for business events
};
```

#### Monitoring & Alerts

**Metrics to Track:**

- Token generation rate
- Token validation success/failure rate
- Expired token access attempts
- Token refresh rate

**Alerts:**

- High rate of invalid token attempts (possible attack)
- Many expired token accesses (may need to extend expiration)

### 6. Error Handling

**Retry Strategy:**

1. **Transient Errors** (network, timeout):
    - Retry with exponential backoff
    - Max retries: 3
    - Delays: 30s, 2m, 10m

2. **Permanent Errors** (invalid email, guest not found):
    - Log error
    - Move to dead letter queue
    - Send alert to admin

3. **Dead Letter Queue:**
    - Queue: `event.published.dlq`
    - Manual review required
    - Retry mechanism for admin

**Error Logging:**

```typescript
{
  eventId: "clx123...",
  guestId: "clx789...",
  error: "Email delivery failed",
  errorCode: "SMTP_ERROR",
  attempt: 2,
  nextRetry: "2026-01-08T20:05:00Z",
  timestamp: "2026-01-08T20:00:00Z"
}
```

### 6. Status Tracking

**Guest Invite Status Flow:**

```
PENDING → SENT → ACCEPTED
              → REJECTED
              → MAYBE
```

**Event-Level Tracking:**

```typescript
interface EventNotificationStatus {
    eventId: string;
    totalGuests: number;
    sentCount: number;
    failedCount: number;
    deliveredCount: number;
    openedCount: number;
    respondedCount: number;
    startedAt: Date;
    completedAt: Date | null;
}
```

## Implementation Checklist

### Phase 1: Message Queue Setup

- [ ] Install and configure RabbitMQ
- [ ] Create `event.published` queue
- [ ] Create dead letter exchange and queue
- [ ] Test message publishing from API
- [ ] Test message consumption in worker

### Phase 2: Worker Implementation

- [ ] Create event processor consumer
- [ ] Implement guest fetching logic
- [ ] Add retry mechanism
- [ ] Add error handling and logging
- [ ] Test with sample events

### Phase 3: RSVP Token System

- [ ] Add rsvpToken and rsvpTokenExpiresAt to Guest schema
- [ ] Run database migration
- [ ] Implement token generation utility
- [ ] Create RSVP endpoints (GET /rsvp/:token, POST /rsvp/:token/respond)
- [ ] Add token validation middleware
- [ ] Implement token refresh logic
- [ ] Test token expiration handling

### Phase 4: Notification Service

- [ ] Set up email service (SendGrid/AWS SES)
- [ ] Create email templates with RSVP links
- [ ] Implement email sending logic with token generation
- [ ] Add RSVP tracking
- [ ] Test email delivery
- [ ] Implement event update notifications

### Phase 5: Status Tracking

- [ ] Add notification status table
- [ ] Track delivery status
- [ ] Create admin dashboard for monitoring
- [ ] Add webhook for email status updates

### Phase 6: Testing & Monitoring

- [ ] Unit tests for all components
- [ ] Integration tests
- [ ] Load testing (100+ guests)
- [ ] Set up monitoring and alerts
- [ ] Create runbooks for common issues

## Configuration

**Environment Variables:**

```bash
# RabbitMQ
RABBITMQ_URL=amqp://localhost:5672
RABBITMQ_EXCHANGE=funkshan.events
RABBITMQ_QUEUE=event.published

# Email Service
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=xxx
EMAIL_FROM=noreply@funkshan.com
EMAIL_FROM_NAME=Funkshan

# Worker
WORKER_CONCURRENCY=5
WORKER_RETRY_ATTEMPTS=3
WORKER_RETRY_DELAY=30000
```

## Monitoring & Metrics

**Key Metrics:**

- Messages published per minute
- Messages processed per minute
- Processing time (p50, p95, p99)
- Failed message count
- Retry count
- Dead letter queue size
- Email delivery rate
- Email open rate
- RSVP response rate

**Alerts:**

- Dead letter queue > 10 messages
- Processing time > 30 seconds
- Failed delivery rate > 5%
- Worker not consuming for > 5 minutes

## Alternatives Considered

### Alternative 1: Direct Email Sending (Not Recommended)

**Pros:** Simpler implementation
**Cons:**

- Blocks API response
- No retry mechanism
- Poor scalability
- No fault tolerance

### Alternative 2: Database Polling (Not Recommended)

**Pros:** No external dependency
**Cons:**

- High database load
- Polling delay
- Less efficient
- Hard to scale

### Alternative 3: Event-Driven with RabbitMQ (✅ Recommended)

**Pros:**

- Async processing
- Reliable delivery
- Scalable
- Built-in retry
- Decoupled services

**Cons:**

- Additional infrastructure
- More complex setup

## Future Enhancements

1. **Batch Processing:** Send invites in batches for large events
2. **Scheduling:** Allow delayed sending (e.g., send invites 2 weeks before event)
3. **A/B Testing:** Test different email templates
4. **Personalization:** ML-based personalized invitation times
5. **Multi-channel:** WhatsApp, Telegram integration
6. **Analytics:** Detailed invitation analytics dashboard
7. **Reminder System:** Automated reminders before event

## Security Considerations

1. **Email Spoofing:** Use SPF, DKIM, DMARC records to prevent email spoofing
2. **Rate Limiting:** Prevent abuse of RSVP endpoints and email sending
3. **Data Privacy:** GDPR compliance for guest data, allow data deletion requests
4. **Unsubscribe:** Allow guests to opt-out of future communications
5. **Secure RSVP Links:**
    - Time-limited tokens (30-day default expiration)
    - Cryptographically secure random tokens (128-bit entropy)
    - Token stored in database (not JWT) for easy revocation
    - Token independent of event data (survives event updates)
    - URL-safe base64url encoding
    - Unique token per guest (no cross-guest access)
    - Automatic token refresh when approaching expiration
    - Rate limiting on token validation endpoints
6. **Queue Security:**
    - Authentication and encryption for RabbitMQ connections
    - Use TLS for RabbitMQ communication in production
    - Restrict queue access with proper user permissions

## References

- [RabbitMQ Documentation](https://www.rabbitmq.com/documentation.html)
- [SendGrid Email API](https://docs.sendgrid.com/)
- [Event-Driven Architecture Patterns](https://martinfowler.com/articles/201701-event-driven.html)
