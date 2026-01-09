# Event Management Database Schema

This document describes the event management schema added to the Funkshan database.

## Overview

The event management system consists of four main tables designed to efficiently store and retrieve all event-related information:

1. **events** - Core event information including venue details
2. **guests** - Guest list with check-in tracking
3. **event_checkin_agents** - Many-to-many relationship for assigning check-in managers
4. **InviteType** and **EntryMechanism** enums for type safety

## Tables

### events

Stores all event information including embedded venue details for optimal performance.

| Column                 | Type           | Description                  | Required            |
| ---------------------- | -------------- | ---------------------------- | ------------------- |
| id                     | TEXT           | Primary key (CUID)           | Yes                 |
| userId                 | TEXT           | Event creator (FK to users)  | Yes                 |
| name                   | TEXT           | Event name                   | Yes                 |
| dateTime               | TIMESTAMP      | Event date and time          | Yes                 |
| details                | TEXT           | Event details/description    | No                  |
| eventImagePath         | TEXT           | Path to event image          | No                  |
| backgroundImagePath    | TEXT           | Path to background image     | No                  |
| venueAddress           | TEXT           | Venue address                | Yes                 |
| venueLatitude          | DOUBLE         | Venue latitude               | No                  |
| venueLongitude         | DOUBLE         | Venue longitude              | No                  |
| venueTimezone          | TEXT           | IANA timezone identifier     | Yes                 |
| venueLocationImagePath | TEXT           | Path to venue location image | No                  |
| venueMapImagePath      | TEXT           | Path to venue map image      | No                  |
| entryMechanism         | EntryMechanism | QR_CODE, PIN_CODE, or BOTH   | No                  |
| qrCode                 | TEXT           | QR code for entry            | No                  |
| pinCode                | TEXT           | PIN code for entry           | No                  |
| dressCode              | TEXT           | Dress code information       | No                  |
| giftSuggestions        | TEXT           | Gift suggestions             | No                  |
| isDraft                | BOOLEAN        | Draft mode flag              | Yes (default: true) |
| publishedAt            | TIMESTAMP      | When event was published     | No                  |
| isActive               | BOOLEAN        | Soft delete flag             | Yes (default: true) |
| createdAt              | TIMESTAMP      | Creation timestamp           | Yes                 |
| updatedAt              | TIMESTAMP      | Last update timestamp        | Yes                 |

**Indexes:**

- `userId` - Fast lookup of user's events
- `dateTime` - Ordering and filtering by date
- `isDraft` - Filtering draft vs published events
- `isActive` - Filtering active events
- `createdAt DESC` - Recent events first

**Design Decision - Draft Mode**: Events are created as drafts by default (`isDraft: true`). This allows users to save work in progress and publish when ready. Published events have `isDraft: false` and a `publishedAt` timestamp.

**Design Decision:** Venue information is embedded directly in the events table rather than normalized into a separate table. This optimizes for the common use case where all event information (including venue) is retrieved together, reducing join operations.

### guests

Stores the guest list for each event with check-in tracking.

| Column       | Type       | Description                            | Required                  |
| ------------ | ---------- | -------------------------------------- | ------------------------- |
| id           | TEXT       | Primary key (CUID)                     | Yes                       |
| eventId      | TEXT       | FK to events                           | Yes                       |
| name         | TEXT       | Guest name                             | Yes                       |
| email        | TEXT       | Guest email                            | No                        |
| phoneNumber  | TEXT       | Guest phone number                     | No                        |
| inviteType   | InviteType | GUEST_ONLY, PLUS_ONE, PLUS_TWO, FAMILY | Yes (default: GUEST_ONLY) |
| hasCheckedIn | BOOLEAN    | Check-in status                        | Yes (default: false)      |
| checkedInAt  | TIMESTAMP  | Check-in timestamp                     | No                        |
| notes        | TEXT       | Additional notes                       | No                        |
| createdAt    | TIMESTAMP  | Creation timestamp                     | Yes                       |
| updatedAt    | TIMESTAMP  | Last update timestamp                  | Yes                       |

**Indexes:**

- `eventId` - Fast lookup of event's guests
- `email` - Searching guests by email
- `phoneNumber` - Searching guests by phone
- `hasCheckedIn` - Filtering checked-in guests

**Design Decision:** Guest information is stored in a separate table for normalization and to support efficient bulk operations (e.g., importing from phone contacts).

### event_checkin_agents

Join table for many-to-many relationship between events and users who can manage check-ins.

| Column     | Type      | Description                 | Required |
| ---------- | --------- | --------------------------- | -------- |
| id         | TEXT      | Primary key (CUID)          | Yes      |
| eventId    | TEXT      | FK to events                | Yes      |
| userId     | TEXT      | FK to users (manager/admin) | Yes      |
| assignedAt | TIMESTAMP | Assignment timestamp        | Yes      |

**Indexes:**

- `eventId` - Fast lookup of event's agents
- `userId` - Fast lookup of user's assigned events
- Unique constraint on `(eventId, userId)` - Prevent duplicate assignments

## Enums

### InviteType

Defines the type of invitation for a guest:

- `GUEST_ONLY` - Single guest only
- `PLUS_ONE` - Guest + 1 additional person
- `PLUS_TWO` - Guest + 2 additional persons
- `PLUS_THREE` - Guest + 3 additional persons
- `PLUS_FOUR` - Guest + 4 additional persons
- `PLUS_FIVE` - Guest + 5 additional persons
- `PLUS_SIX` - Guest + 6 additional persons
- `FAMILY` - Guest + family members (unlimited)

### EntryMechanism

Defines how guests can check in to the event:

- `QR_CODE` - QR code scanning only
- `PIN_CODE` - PIN code entry only
- `BOTH` - Both QR code and PIN code supported

## Relationships

```
User (1) ----< (many) Event
  |
  |----< (many) EventCheckinAgent

Event (1) ----< (many) Guest
  |
  |----< (many) EventCheckinAgent

EventCheckinAgent >---- (many) User
EventCheckinAgent >---- (many) Event
```

## Usage Examples

### Create Event with All Details

```typescript
import { detectTimezoneFromCoordinates } from '@funkshan/utils';

const event = await eventRepository.createEvent({
    userId: 'user123',
    name: 'Summer BBQ Party',
    dateTime: new Date('2026-07-15T22:00:00Z'), // UTC time (6 PM EDT)
    details: 'Join us for an evening of fun, food, and friends!',
    eventImagePath: '/images/events/summer-bbq.jpg',
    backgroundImagePath: '/images/backgrounds/sunset.jpg',
    venueAddress: '123 Park Ave, New York, NY 10001',
    venueLatitude: 40.7484,
    venueLongitude: -73.9857,
    venueTimezone: detectTimezoneFromCoordinates(40.7484, -73.9857), // "America/New_York"
    venueLocationImagePath: '/images/venues/park-ave-location.jpg',
    venueMapImagePath: '/images/venues/park-ave-map.jpg',
    entryMechanism: 'BOTH',
    qrCode: 'EVENT-SUMMER-BBQ-2026',
    pinCode: '1234',
    dressCode: 'Casual summer attire',
    giftSuggestions: 'Bring your favorite beverage or dessert!',
    isDraft: true, // Save as draft (default)
});
```

### Save Event as Draft and Publish Later

```typescript
// Step 1: Create event as draft (default)
const draftEvent = await eventRepository.createEvent({
    userId: 'user123',
    name: 'Work in Progress Event',
    dateTime: new Date('2026-08-01T18:00:00Z'),
    venueAddress: '456 Main St, City',
    venueTimezone: 'America/New_York',
    isDraft: true, // Explicitly save as draft
});

// Step 2: User can continue editing...
await eventRepository.updateEvent(draftEvent.id, {
    details: 'Added more details...',
    eventImagePath: '/images/updated.jpg',
});

// Step 3: When ready, publish the event
const publishedEvent = await eventRepository.publishEvent(draftEvent.id);
// Now: isDraft = false, publishedAt = current timestamp

// Find all drafts for a user
const drafts = await eventRepository.findDraftEvents('user123');

// Find all published events
const published = await eventRepository.findPublishedEvents('user123');
```

### Bulk Import Guests from Contacts

```typescript
const guests = [
    {
        name: 'John Doe',
        email: 'john@example.com',
        phoneNumber: '+1234567890',
        inviteType: 'PLUS_ONE',
    },
    { name: 'Jane Smith', phoneNumber: '+1234567891', inviteType: 'FAMILY' },
    // ... more guests
];

const count = await guestRepository.bulkCreateGuests({
    eventId: event.id,
    guests,
});
```

### Retrieve Complete Event Information

```typescript
// Optimized query that fetches event, guests, and checkin agents in one go
const completeEvent = await eventRepository.findByIdWithRelations(eventId);

// Returns:
// {
//   id, name, dateTime, details, venue info, etc.,
//   guests: [...],
//   checkinAgents: [{ user: {...} }, ...]
// }
```

### Assign Check-in Agents

```typescript
// Assign multiple managers to handle check-ins
const agentIds = ['manager1', 'manager2', 'manager3'];
await checkinAgentRepository.bulkAssignAgents(eventId, agentIds);
```

### Guest Check-in

```typescript
// Check in a guest
await guestRepository.checkInGuest(guestId);

// Get check-in statistics
const checkedInCount = await guestRepository.getCheckedInCount(eventId);
const totalGuests = await guestRepository.getTotalGuestsCount(eventId);
```

## Performance Optimizations

1. **Embedded Venue Data**: Venue information is stored directly in the events table to minimize joins when retrieving complete event data.

2. **Strategic Indexing**: All foreign keys and commonly queried fields are indexed for fast lookups.

3. **Bulk Operations**: Repository methods support bulk guest creation and agent assignment for efficient data import.

4. **Cascade Deletes**: When an event is deleted, all related guests and checkin agents are automatically deleted, maintaining referential integrity.

5. **Optimized Retrieval**: The `findByIdWithRelations()` method uses Prisma's `include` to fetch all related data in a single query.

6. **Timezone Handling**: All timestamps stored in UTC with separate timezone fields for proper multi-timezone support. See [Timezone Handling Guide](./TIMEZONE_HANDLING.md) for details.

## Timezone Support

The schema includes comprehensive timezone support for international events:

- **User Timezone** (`users.timezone`): Optional field storing user's preferred timezone
- **Event Timezone** (`events.venueTimezone`): Required field storing the venue's timezone

### Key Points

1. **All timestamps in UTC**: Database stores all `DateTime` fields in UTC
2. **IANA Identifiers**: Use standard timezone identifiers like "America/New_York", not abbreviations
3. **Auto-detection**: Timezone can be detected from venue coordinates
4. **Display Conversion**: Times converted to appropriate timezone only for display

### Example: Creating Event with Timezone

```typescript
import { detectTimezoneFromCoordinates } from '@funkshan/utils';

// Detect timezone from venue coordinates
const venueTimezone = detectTimezoneFromCoordinates(51.5074, -0.1278); // London
// Returns: "Europe/London"

const event = await eventRepository.createEvent({
    // ... other fields
    venueLatitude: 51.5074,
    venueLongitude: -0.1278,
    venueTimezone: venueTimezone,
    dateTime: new Date('2026-08-20T13:00:00Z'), // UTC
});
```

### Example: Displaying Event Time

```typescript
import { EventTimezoneHelpers } from '@funkshan/utils';

// Show event time in both event's timezone and user's timezone
const displayTime = EventTimezoneHelpers.formatEventTime(
    event.dateTime, // UTC time from database
    event.venueTimezone, // "Europe/London"
    user.timezone // "America/New_York"
);
// Output: "August 20, 2026, 02:00 PM BST (09:00 AM EDT your time)"
```

**For complete timezone documentation, see [Timezone Handling Guide](./TIMEZONE_HANDLING.md).**

## Migrations

Two migration files have been created:

1. **Event Management Schema**:

    ```
    packages/database/prisma/migrations/20260101224653_add_event_management/migration.sql
    ```

    Adds events, guests, and event_checkin_agents tables

2. **Timezone Support**:
    ```
    packages/database/prisma/migrations/20260101225304_add_timezone_support/migration.sql
    ```
    Adds timezone fields to users and events tables

To apply the migration:

```bash
cd packages/database
pnpm prisma migrate deploy
```

To regenerate Prisma client:

```bash
pnpm prisma generate
```

## Repository Classes

All repository classes are located in `packages/database/src/repositories/`:

- `event.repository.ts` - Event operations
- `guest.repository.ts` - Guest management and check-ins
- `event-checkin-agent.repository.ts` - Check-in agent assignment

These repositories extend the `BaseRepository` class and provide type-safe, error-handled methods for all database operations.
