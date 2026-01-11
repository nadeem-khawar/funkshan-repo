# RSVP Token Implementation Guide

## Overview

This document provides a quick reference for implementing secure, time-limited RSVP tokens for guest invitations.

## Key Design Decisions

### ✅ What We Chose

- **Database-stored tokens** (not JWT)
- **Event-independent expiration** (30 days from generation)
- **Simple random string** (32 characters, crypto-safe)
- **Token survives event updates** (no event data encoded)

### ❌ What We Avoided

- JWT tokens (would need to encode event data, complicate updates)
- Event-time-based expiration (breaks when event is rescheduled)
- Signed URLs with event data (invalidates on any event change)

## Database Schema

```prisma
model Guest {
  // ... existing fields
  rsvpToken          String?   @unique
  rsvpTokenExpiresAt DateTime?

  @@index([rsvpToken])
}
```

**Migration:** `20260108231924_add_guest_rsvp_token`

## Token Properties

- **Length:** 32 characters
- **Encoding:** Base64URL (URL-safe)
- **Entropy:** 128 bits (24 random bytes)
- **Lifetime:** 30 days (configurable)
- **Uniqueness:** Per guest, stored in database

## Implementation Checklist

### Phase 1: Database

- [x] Add rsvpToken and rsvpTokenExpiresAt to Guest model
- [x] Create migration SQL
- [x] Run migration: `pnpm run prisma:migrate:from-api`
- [x] Regenerate Prisma Client: `pnpm run prisma:generate`

### Phase 2: Token Generation Utility

- [x] Create `packages/utils/src/rsvp-token.ts`
- [x] Add `generateRsvpToken()` function
- [x] Add `calculateTokenExpiration(days = 30)` function
- [x] Export from utils package

### Phase 3: Worker Integration

- [x] Update `sendInvitation()` in worker to generate tokens
- [x] Store token in database before sending email
- [ ] Include RSVP URLs in email template

### Phase 4: API Endpoints

- [ ] Create `GET /api/v1/rsvp/:token` - Fetch event details
- [ ] Create `POST /api/v1/rsvp/:token/respond` - Update RSVP status
- [ ] Add token validation middleware
- [ ] Add rate limiting to RSVP endpoints

### Phase 5: Token Management

- [ ] Implement token refresh logic (7-day threshold)
- [ ] Add token revocation (set to null)
- [ ] Handle expired tokens gracefully

## Quick Code Snippets

### Generate Token

```typescript
import { randomBytes } from 'crypto';

export function generateRsvpToken(): string {
    return randomBytes(24)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

export function calculateTokenExpiration(days = 30): Date {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + days);
    return expiresAt;
}
```

### Update Guest with Token

```typescript
const token = generateRsvpToken();
const expiresAt = calculateTokenExpiration();

await prisma.guest.update({
    where: { id: guest.id },
    data: {
        rsvpToken: token,
        rsvpTokenExpiresAt: expiresAt,
    },
});
```

### Build RSVP URLs

```typescript
const baseUrl = `${process.env.WEB_APP_URL}/rsvp/${guest.rsvpToken}`;
const acceptUrl = `${baseUrl}?action=accept`;
const declineUrl = `${baseUrl}?action=decline`;
```

### Validate Token

```typescript
const guest = await prisma.guest.findUnique({
    where: { rsvpToken: token },
    include: { event: true },
});

if (!guest) {
    throw new Error('Invalid RSVP link');
}

if (guest.rsvpTokenExpiresAt && guest.rsvpTokenExpiresAt < new Date()) {
    throw new Error('RSVP link has expired');
}
```

## Event Update Handling

**When event time/location changes:**

1. Event updates normally in database
2. Tokens remain valid (no regeneration needed)
3. Worker sends update notification to affected guests
4. Same RSVP URLs continue to work

```typescript
// Event update doesn't affect tokens
await prisma.event.update({
    where: { id: eventId },
    data: { dateTime: newDateTime },
});

// Notify guests using existing tokens
await publishEventUpdated({
    eventId,
    changedFields: ['dateTime'],
});
```

## Security Features

- ✅ Time-limited (30-day expiration)
- ✅ Cryptographically secure (128-bit entropy)
- ✅ Database-validated (easy revocation)
- ✅ URL-safe encoding (no special chars)
- ✅ Unique per guest (no sharing)
- ✅ Rate-limited endpoints
- ✅ Independent of event data

## Testing Checklist

- [ ] Generate 100 tokens, verify uniqueness
- [ ] Test token with 30-day expiration
- [ ] Test expired token rejection
- [ ] Test invalid token rejection
- [ ] Test RSVP with valid token
- [ ] Test event update doesn't break tokens
- [ ] Test token refresh near expiration
- [ ] Load test: 1000 guests per event

## Monitoring

**Metrics:**

- Token generation rate
- Token validation success/failure
- Expired token attempts
- Token refresh rate

**Alerts:**

- High invalid token rate (> 5%)
- Many expired token attempts

## Future Enhancements

- [ ] Custom expiration per event type
- [ ] Token usage analytics
- [ ] Guest-initiated token refresh
- [ ] Magic link login (reuse token)
- [ ] QR code with embedded token

## References

- Full documentation: [EVENT_PUBLISHING_FLOW.md](./EVENT_PUBLISHING_FLOW.md#5-secure-rsvp-token-implementation)
- Database schema: `packages/database/prisma/schema.prisma`
- Migration: `packages/database/prisma/migrations/20260108231924_add_guest_rsvp_token/`
