# Next Steps - Event Management Implementation

## Summary

The event management schema has been successfully added to the Funkshan database. Here's what was completed:

### ✅ Completed

1. **Schema Design** - Added 3 new tables and 2 enums to `schema.prisma`:
    - `events` - Stores event information with embedded venue details and timezone
    - `guests` - Stores guest list with check-in tracking
    - `event_checkin_agents` - Join table for check-in managers
    - `InviteType` enum - Guest invitation types
    - `EntryMechanism` enum - Entry methods (QR/PIN)

2. **Timezone Support** - Added comprehensive timezone handling:
    - `User.timezone` - User's preferred timezone (optional)
    - `Event.venueTimezone` - Event venue's timezone (required)
    - Full timezone utility library with 15+ helper functions
    - Auto-detection from coordinates
    - Display formatters for cross-timezone events

3. **Repository Classes** - Created 3 repository classes:
    - [event.repository.ts](../packages/database/src/repositories/event.repository.ts)
    - [guest.repository.ts](../packages/database/src/repositories/guest.repository.ts)
    - [event-checkin-agent.repository.ts](../packages/database/src/repositories/event-checkin-agent.repository.ts)

4. **Utility Functions** - Created timezone utilities:
    - [timezone.ts](../packages/utils/src/timezone.ts)
    - Browser timezone detection
    - Coordinate-based timezone detection
    - Format helpers for cross-timezone display
    - Event-specific timezone helpers

5. **Migration Files** - Created 2 SQL migrations:
    - `20260101224653_add_event_management/migration.sql` - Event tables
    - `20260101225304_add_timezone_support/migration.sql` - Timezone fields

6. **Documentation** - Created comprehensive documentation:
    - [event-management-schema.md](./event-management-schema.md) - Schema details
    - [TIMEZONE_HANDLING.md](./TIMEZONE_HANDLING.md) - Complete timezone guide
    - [TIMEZONE_IMPLEMENTATION_SUMMARY.md](./TIMEZONE_IMPLEMENTATION_SUMMARY.md) - Quick reference

### 🔧 Required Next Steps

Before you can use the new event management features, you need to:

#### 1. Set up Database Connection

Ensure you have a `DATABASE_URL` environment variable configured in your `.env` file:

```bash
# packages/database/.env
DATABASE_URL="postgresql://user:password@localhost:5432/funkshan?schema=public"
```

#### 2. Run the Migration

Apply the migration to your database:

```bash
cd packages/database
pnpm prisma migrate deploy
```

Or if you're in development:

```bash
pnpm prisma migrate dev
```

#### 3. Regenerate Prisma Client

Generate the updated Prisma client with the new types:

```bash
cd packages/database
pnpm prisma generate
```

This will create the TypeScript types for:

- `Event`, `Guest`, `EventCheckinAgent` models
- `InviteType`, `EntryMechanism` enums
- All related Prisma input/output types

#### 4. Verify TypeScript Compilation

After regenerating the client, verify there are no TypeScript errors:

```bash
cd packages/database
pnpm typecheck
```

### 📋 Optional Next Steps

#### 5. Create API Contracts

Create TypeScript contracts in `packages/api-contracts/src/event/`:

- `create-event.contract.ts`
- `get-event.contract.ts`
- `update-event.contract.ts`
- `list-events.contract.ts`
- `guest-checkin.contract.ts`

#### 6. Implement API Endpoints

Create Fastify routes in `apps/funkshan-api/src/routes/`:

- Event CRUD operations
- Guest management
- Check-in operations
- Checkin agent assignment

#### 7. Create Services

Create service classes in `apps/funkshan-api/src/services/`:

- `EventService.ts` - Business logic for events
- `GuestService.ts` - Guest management and check-in logic

#### 8. Add Validation Schemas

Create validation schemas in `packages/validation/src/`:

- Event validation rules
- Guest validation rules
- Check-in validation rules

### 🎯 Key Features to Implement

Based on the schema, here are the key features you can now build:

1. **Event Management**
    - Create events with venue and optional settings
    - Upload event images and backgrounds
    - Configure QR code or PIN code entry
    - Set dress code and gift suggestions

2. **Guest List Management**
    - Import guests from phone contacts
    - Bulk guest creation
    - Track invitation types (Guest only, +1, +2, Family)
    - Add optional email and phone numbers

3. **Check-in System**
    - QR code scanning for entry
    - PIN code verification
    - Track check-in status and timestamp
    - View check-in statistics

4. **Access Control**
    - Assign multiple check-in agents (managers)
    - Allow agents to manage check-ins
    - Event creator has full control

5. **Venue Information**
    - Store complete venue address
    - Optional geo-location (latitude/longitude)
    - Optional venue images and maps

### 📊 Database Optimization

The schema is optimized for the common use case of retrieving all event information together:

- Venue details are embedded in the events table (no extra join)
- Strategic indexes on frequently queried fields
- Single query retrieval with `findByIdWithRelations()`
- Bulk operations for guest import and agent assignment

### 🔍 Testing Recommendations

1. Test migration on a development database first
2. Verify all indexes are created correctly
3. Test bulk guest import performance
4. Validate cascade deletes work as expected
5. Test concurrent check-in operations

### 📝 Notes

- All image paths are stored as strings (not binary data)
- Venue information is embedded for performance
- Soft delete is implemented via `isActive` flag
- All timestamps are stored in UTC
- Foreign keys have CASCADE delete for data integrity

### 🚀 Getting Started

Once you've completed steps 1-4 above, you can start using the repositories:

```typescript
import {
    EventRepository,
    GuestRepository,
    EventCheckinAgentRepository,
} from '@funkshan/database';
import { prisma } from '@funkshan/database';

const eventRepo = new EventRepository(prisma);
const guestRepo = new GuestRepository(prisma);
const agentRepo = new EventCheckinAgentRepository(prisma);

// Create an event
const event = await eventRepo.createEvent({
    userId: 'user123',
    name: 'My Event',
    dateTime: new Date('2026-07-15'),
    venueAddress: '123 Main St',
    // ... other fields
});

// Add guests
await guestRepo.bulkCreateGuests({
    eventId: event.id,
    guests: [{ name: 'John Doe', inviteType: 'PLUS_ONE' }],
});
```

For complete examples, see [event-management-schema.md](./event-management-schema.md).
