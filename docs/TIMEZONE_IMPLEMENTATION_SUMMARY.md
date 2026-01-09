# Timezone Implementation Summary

## What Was Added

### Database Schema Changes

#### 1. User Model - Added Timezone Field

```prisma
model User {
  // ... existing fields
  timezone  String?  // IANA timezone identifier (optional)
}
```

- **Purpose**: Store user's preferred timezone for displaying all dates/times
- **Type**: Optional string (defaults to UTC if not set)
- **Format**: IANA timezone identifiers (e.g., "America/New_York", "Europe/London")
- **Usage**: Convert all displayed times to user's preferred timezone

#### 2. Event Model - Added Venue Timezone Field

```prisma
model Event {
  // ... existing fields
  venueTimezone  String  // IANA timezone identifier (required)
}
```

- **Purpose**: Store the timezone where the event is physically happening
- **Type**: Required string
- **Format**: IANA timezone identifiers
- **Usage**: Display event's "local time" and enable cross-timezone coordination

### Utility Functions

Created comprehensive timezone utilities in `packages/utils/src/timezone.ts`:

#### Core Functions

- `getBrowserTimezone()` - Detect user's timezone from browser
- `detectTimezoneFromCoordinates(lat, lng)` - Auto-detect timezone from venue location
- `isValidTimezone(timezone)` - Validate IANA timezone identifiers
- `formatInTimezone(date, timezone, options)` - Format date in specific timezone
- `getTimezoneOffset(timezone, date)` - Get UTC offset in hours
- `getTimezoneAbbreviation(timezone, date)` - Get timezone abbreviation (EST, PST, etc.)
- `getTimezoneList()` - Get all common timezones for dropdowns
- `getTimezoneDisplayName(timezone)` - Get friendly timezone name

#### Event-Specific Helpers

```typescript
EventTimezoneHelpers.formatEventTime(
    eventDateTime,
    eventTimezone,
    userTimezone
);
EventTimezoneHelpers.isEventSoon(eventDateTime, timezone);
EventTimezoneHelpers.isEventHappening(eventDateTime, durationHours);
```

### Migrations

1. **Migration 1**: `20260101224653_add_event_management`
    - Added events, guests, event_checkin_agents tables

2. **Migration 2**: `20260101225304_add_timezone_support`
    - Added `timezone` field to users table (nullable)
    - Added `venueTimezone` field to events table (required, defaults to 'UTC')

### Documentation

Created three comprehensive documentation files:

1. **[TIMEZONE_HANDLING.md](./TIMEZONE_HANDLING.md)** - Complete timezone guide
    - Database design rationale
    - Implementation examples
    - Frontend display patterns
    - Best practices and anti-patterns
    - Production recommendations

2. **[event-management-schema.md](./event-management-schema.md)** - Updated with timezone info
    - Schema includes timezone fields
    - Usage examples with timezone detection
    - Timezone display examples

3. **This file** - Quick reference summary

## How It Works

### The Golden Rule

**All timestamps are stored in UTC in the database.** Timezone information is stored separately and used only for display/conversion.

```
Database (PostgreSQL)
├── DateTime fields → Always UTC
├── User.timezone → "America/New_York" (where the user is)
└── Event.venueTimezone → "Europe/London" (where the event is)

Display Layer
├── Convert UTC → User's timezone (for most UI elements)
├── Convert UTC → Event's timezone (for event details)
└── Show both when they differ
```

### Data Flow Example

```typescript
// 1. Creating an Event
const event = await eventRepo.createEvent({
    name: 'London Meetup',
    dateTime: new Date('2026-08-20T13:00:00Z'), // UTC in database
    venueLatitude: 51.5074,
    venueLongitude: -0.1278,
    venueTimezone: 'Europe/London', // Detected from coordinates
});

// 2. User in New York views the event
const user = { timezone: 'America/New_York' };

// 3. Display to user
const display = EventTimezoneHelpers.formatEventTime(
    event.dateTime, // 2026-08-20 13:00 UTC
    event.venueTimezone, // "Europe/London"
    user.timezone // "America/New_York"
);

// Result: "August 20, 2026, 02:00 PM BST (09:00 AM EDT your time)"
```

## Key Benefits

### 1. Accurate Time Display

- Events show correct local time regardless of user location
- Handles daylight saving time automatically
- No ambiguity with timezone abbreviations

### 2. Cross-Timezone Support

- Users in Tokyo can see events in New York with proper time conversion
- Event organizers see event time in venue's timezone
- Guests see event time in their own timezone

### 3. International-Ready

- IANA timezone identifiers work globally
- Supports all timezones worldwide
- Future-proof for timezone rule changes

### 4. User Experience

- "Event starts at 6:00 PM EDT (11:00 PM BST your time)"
- Clear indication when timezones differ
- No mental math required for users

## Implementation Checklist

### ✅ Completed

- [x] Added timezone fields to schema
- [x] Created migration files
- [x] Built timezone utility functions
- [x] Updated repository interfaces
- [x] Wrote comprehensive documentation
- [x] Added timezone detection from coordinates
- [x] Created display helpers

### 🔧 Next Steps (For You)

1. **Run Migrations**

    ```bash
    cd packages/database
    pnpm prisma migrate deploy
    pnpm prisma generate
    ```

2. **Update Event Creation UI**
    - Add timezone picker or auto-detect from venue
    - Use `detectTimezoneFromCoordinates()` when user enters address
    - Validate timezone before submission

3. **Update User Profile**
    - Auto-detect user timezone: `getBrowserTimezone()`
    - Allow manual override in settings
    - Store in user.timezone field

4. **Update Event Display**
    - Use `EventTimezoneHelpers.formatEventTime()` everywhere
    - Show timezone indicator when event is in different timezone
    - Display countdown timers in user's timezone

5. **Update Check-in System**
    - Display check-in times in event's timezone
    - Show timestamps to agents in their preferred timezone

6. **Add to API Responses**
    ```typescript
    {
      "event": {
        "dateTime": "2026-08-20T13:00:00Z", // UTC
        "venueTimezone": "Europe/London",
        "displayTime": "August 20, 2026, 2:00 PM BST"
      }
    }
    ```

## Common Use Cases

### Use Case 1: User Creates Event

```typescript
// Frontend: Get venue timezone from coordinates
const timezone = detectTimezoneFromCoordinates(lat, lng);

// Frontend: Send UTC time to backend
const eventData = {
    dateTime: new Date('2026-07-15T22:00:00Z'), // UTC
    venueTimezone: timezone, // "America/New_York"
    // ... other fields
};

// Backend: Store as-is (already in UTC)
await eventRepo.createEvent(eventData);
```

### Use Case 2: User Views Event List

```typescript
// Backend: Fetch events (times in UTC)
const events = await eventRepo.findByUserId(userId);

// Backend: Get user's timezone
const user = await userRepo.findById(userId);

// Backend/Frontend: Format for display
const formattedEvents = events.map(event => ({
    ...event,
    displayTime: EventTimezoneHelpers.formatEventTime(
        event.dateTime,
        event.venueTimezone,
        user.timezone
    ),
    isDifferentTimezone: event.venueTimezone !== user.timezone,
}));
```

### Use Case 3: Send Event Reminder

```typescript
// Get user's upcoming events
const events = await eventRepo.findUpcomingEvents(userId);
const user = await userRepo.findById(userId);

for (const event of events) {
    if (EventTimezoneHelpers.isEventSoon(event.dateTime, event.venueTimezone)) {
        // Format in user's timezone for notification
        const time = formatInTimezone(event.dateTime, user.timezone || 'UTC');

        await sendNotification({
            title: `${event.name} starts soon!`,
            body: `Event starts at ${time}`,
        });
    }
}
```

### Use Case 4: Guest Checks In

```typescript
// Check in guest
const guest = await guestRepo.checkInGuest(guestId);

// Display check-in time in event's timezone
const checkinTime = formatInTimezone(guest.checkedInAt, event.venueTimezone, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
});
// Shows: "06:45:30 PM EDT"
```

## Production Considerations

### 1. Timezone Detection Service

The built-in `detectTimezoneFromCoordinates()` is a simplified heuristic. For production:

**Option A: Google Maps Timezone API**

```typescript
async function getTimezoneFromGoogle(
    lat: number,
    lng: number
): Promise<string> {
    const timestamp = Math.floor(Date.now() / 1000);
    const url = `https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${lng}&timestamp=${timestamp}&key=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.timeZoneId; // Returns IANA identifier
}
```

**Option B: TimeZoneDB API** (Free tier available)

```typescript
async function getTimezoneFromDB(lat: number, lng: number): Promise<string> {
    const url = `https://api.timezonedb.com/v2.1/get-time-zone?key=${API_KEY}&format=json&by=position&lat=${lat}&lng=${lng}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.zoneName;
}
```

**Option C: geo-tz library** (Offline, no API calls)

```bash
pnpm add geo-tz
```

```typescript
import { find } from 'geo-tz';

const timezone = find(lat, lng)[0]; // Returns IANA identifier
```

### 2. Caching Strategy

Cache timezone lookups to reduce API calls:

```typescript
// Redis cache
const cacheKey = `timezone:${lat}:${lng}`;
let timezone = await redis.get(cacheKey);

if (!timezone) {
    timezone = await getTimezoneFromService(lat, lng);
    await redis.set(cacheKey, timezone, 'EX', 86400 * 30); // Cache 30 days
}
```

### 3. Edge Cases to Handle

- **Traveling users**: Allow temporary timezone override
- **Midnight events**: Handle date boundary crossings
- **DST transitions**: Let IANA identifiers handle automatically
- **Multi-day events**: Store start/end times, timezone applies to both

### 4. Testing Strategy

Test with various scenarios:

```typescript
// Same timezone
testEvent('NYC event, NYC user', 'America/New_York', 'America/New_York');

// Different timezone
testEvent('Tokyo event, NYC user', 'Asia/Tokyo', 'America/New_York');

// DST transition
testEvent(
    'Event during DST change',
    'America/New_York',
    'America/New_York',
    new Date('2026-03-08')
);

// Across date line
testEvent(
    'Event crossing date line',
    'Pacific/Auckland',
    'America/Los_Angeles'
);
```

## Quick Reference

### Importing Utilities

```typescript
import {
    getBrowserTimezone,
    detectTimezoneFromCoordinates,
    formatInTimezone,
    EventTimezoneHelpers,
    isValidTimezone,
} from '@funkshan/utils';
```

### Common Patterns

**Pattern 1: Auto-detect timezone**

```typescript
const timezone = detectTimezoneFromCoordinates(lat, lng);
```

**Pattern 2: Format for display**

```typescript
const display = formatInTimezone(date, timezone);
```

**Pattern 3: Show both timezones**

```typescript
const display = EventTimezoneHelpers.formatEventTime(date, eventTz, userTz);
```

**Pattern 4: Validate timezone**

```typescript
if (!isValidTimezone(timezone)) throw new Error('Invalid timezone');
```

## Resources

- **Full Guide**: [TIMEZONE_HANDLING.md](./TIMEZONE_HANDLING.md)
- **Schema Docs**: [event-management-schema.md](./event-management-schema.md)
- **Utility Code**: `packages/utils/src/timezone.ts`
- **Migration SQL**: `packages/database/prisma/migrations/*/migration.sql`

## Questions?

Common questions answered in [TIMEZONE_HANDLING.md](./TIMEZONE_HANDLING.md):

- Why IANA identifiers instead of abbreviations?
- How to handle daylight saving time?
- What about users traveling across timezones?
- How to display times on the frontend?
- Best practices for API responses?
