# Timezone Handling Guide

## Overview

The Funkshan event management system uses **Luxon** and **geo-tz** libraries for robust timezone handling across different locations.

### Libraries Used

- **Luxon** - Modern DateTime library with excellent timezone support (replacement for Moment.js)
- **geo-tz** - Offline coordinate-to-timezone lookup (no API calls needed)

**Why libraries over custom code?** See [Library Recommendation](./TIMEZONE_LIBRARY_RECOMMENDATION.md) for detailed comparison.

## Database Design

### Storage Strategy

**All timestamps are stored in UTC** in the PostgreSQL database. This is the golden rule of timezone handling:

- `DateTime` fields in Prisma automatically store in UTC
- PostgreSQL `TIMESTAMP WITH TIME ZONE` is used internally
- Never store local times in the database

### Timezone Fields

#### User Timezone

```prisma
model User {
  timezone  String?  // IANA timezone identifier (e.g., "America/New_York")
  // ... other fields
}
```

- **Optional field** - defaults to UTC if not set
- Stores user's preferred timezone
- Can be detected from browser or set manually by user
- Used for displaying all dates/times to the user

#### Event Timezone

```prisma
model Event {
  dateTime      DateTime  // Event date/time stored in UTC
  venueTimezone String    // IANA timezone of the venue (required)
  // ... other fields
}
```

- **Required field** - every event must have a timezone
- Represents the timezone where the event is physically happening
- Should be determined from venue location (latitude/longitude)
- Critical for showing "local event time" to users

## IANA Timezone Identifiers

We use standardized IANA timezone identifiers (not abbreviations):

✅ **Correct:**

- `America/New_York` (not "EST" or "EDT")
- `Europe/London` (not "GMT" or "BST")
- `Asia/Kolkata` (not "IST")
- `Australia/Sydney` (not "AEST")

❌ **Incorrect:**

- Abbreviations like "PST", "EST", "GMT"
- Offset strings like "UTC-5", "+05:30"
- Windows timezone names

### Why IANA Identifiers?

- Handle daylight saving time automatically
- Unambiguous across regions
- Supported by JavaScript `Intl` API
- Standard across all platforms

## Implementation

### 1. Creating an Event

When creating an event, the timezone is auto-detected from venue coordinates using geo-tz:

```typescript
import { EventRepository } from '@funkshan/database';
import { detectTimezoneFromCoordinates } from '@funkshan/utils';

const eventRepo = new EventRepository(prisma);

// Auto-detect timezone from coordinates using geo-tz (offline, accurate)
const venueTimezone = detectTimezoneFromCoordinates(40.7589, -73.9851); // NYC
// Returns: "America/New_York"

const event = await eventRepo.createEvent({
  userId: 'user123',
  name: 'NYC Meetup',
  dateTime: new Date('2026-07-15T22:00:00Z'), // Always store UTC
  venueAddress: '123 Broadway, New York, NY 10001',
  venueLatitude: 40.7589,
  venueLongitude: -73.9851,
  venueTimezone: venueTimezone,
```

### 2. Displaying Event Time

Show event time using Luxon-powered helpers:

```typescript
import { EventTimezoneHelpers } from '@funkshan/utils';

// Event stored in database
const event = {
    dateTime: new Date('2026-07-15T22:00:00Z'), // UTC
    venueTimezone: 'America/New_York',
};

// User viewing the event
const user = {
    timezone: 'Europe/London',
};

// Display to user (automatically formats with Luxon)
const displayTime = EventTimezoneHelpers.formatEventTime(
    event.dateTime,
    event.venueTimezone,
    user.timezone
);
// Output: "July 15, 2026, 6:00 PM EDT (11:00 PM BST your time)"
```

### 3. Additional Helpers (Powered by Luxon)

````typescript
// Get relative time
const relative = EventTimezoneHelpers.getRelativeTime(
  event.dateTime,
  event.venueTimezone
);
// Output: "in 3 days"

// Get countdown
const countdown = EventTimezoneHelpers.getCountdown(event.dateTime);
// Output: { days: 3, hours: 5, minutes: 42 }

// Check if event is soon
const isSoon = EventTimezoneHelpers.isEventSoon(
  event.dateTime,
  event.venueTimezone
);
// Output: true (if within 24 hours)
### 3. User Timezone Detection

#### Frontend (Browser)

```typescript
import { getBrowserTimezone } from '@funkshan/utils';

// Detect user's timezone from browser
const userTimezone = getBrowserTimezone();
// Returns: "America/Los_Angeles" (or whatever the user's system timezone is)

// Save to user profile
await updateUser({
    timezone: userTimezone,
});
````

#### Backend (API)

```typescript
// Accept timezone from request headers or body
app.post('/api/users/profile', async (req, res) => {
    const { timezone } = req.body;

    // Validate timezone
    if (!isValidTimezone(timezone)) {
        return res.status(400).json({ error: 'Invalid timezone' });
    }

    await userRepo.update(userId, { timezone });
});
```

### 4. Timezone Validation

Always validate timezone strings before storing:

```typescript
import { isValidTimezone } from '@funkshan/utils';

const timezone = 'America/New_York';

if (!isValidTimezone(timezone)) {
    throw new Error('Invalid timezone identifier');
}
// Safe to store in database
```

### 5. Common Use Cases

#### Event List Display

```typescript
// Show events in user's local time
const events = await eventRepo.findByUserId(userId);

const eventsWithLocalTime = events.map(event => ({
    ...event,
    // Event's actual time
    eventLocalTime: formatInTimezone(event.dateTime, event.venueTimezone),
    // User's equivalent time
    userLocalTime: formatInTimezone(event.dateTime, user.timezone),
    // Timezone difference indicator
    isDifferentTimezone: event.venueTimezone !== user.timezone,
}));
```

#### Check-in Time Display

```typescript
// When a guest checks in, show the time in event's timezone
const guest = await guestRepo.checkInGuest(guestId);

const checkinDisplay = formatInTimezone(
    guest.checkedInAt!,
    event.venueTimezone,
    { hour: '2-digit', minute: '2-digit', second: '2-digit' }
);
// Output: "06:45:30 PM EDT"
```

#### Event Reminders

```typescript
// Send reminders in user's timezone
const upcomingEvents = await eventRepo.findUpcomingEvents(userId);

for (const event of upcomingEvents) {
    if (EventTimezoneHelpers.isEventSoon(event.dateTime, event.venueTimezone)) {
        const reminderTime = formatInTimezone(
            event.dateTime,
            user.timezone || 'UTC'
        );

        await sendNotification(userId, {
            title: 'Event starting soon!',
            body: `${event.name} starts at ${reminderTime}`,
        });
    }
}
```

## Frontend Display Patterns

### Pattern 1: Primary Event Time + User's Time

```
Event: Summer BBQ Party
Date: July 15, 2026, 6:00 PM EDT
Your local time: July 15, 2026, 11:00 PM BST
```

### Pattern 2: Inline Conversion

```
Event starts: July 15, 2026, 6:00 PM EDT (11:00 PM BST your time)
```

### Pattern 3: Timezone Badge

```
Event: Tokyo Summit
Date: August 20, 2026, 9:00 AM JST
[Different Timezone] Your time: August 19, 2026, 5:00 PM PDT
```

## Timezone Utilities Reference

### Available Functions

| Function                          | Description                       | Example                                                 |
| --------------------------------- | --------------------------------- | ------------------------------------------------------- |
| `getBrowserTimezone()`            | Get user's browser timezone       | `"America/New_York"`                                    |
| `detectTimezoneFromCoordinates()` | Guess timezone from lat/long      | `detectTimezoneFromCoordinates(40.7, -74.0)`            |
| `isValidTimezone()`               | Validate IANA identifier          | `isValidTimezone("America/New_York")`                   |
| `formatInTimezone()`              | Format date in specific timezone  | `formatInTimezone(date, "Europe/London")`               |
| `getTimezoneOffset()`             | Get offset in hours               | `getTimezoneOffset("America/New_York")` → `-5`          |
| `getTimezoneAbbreviation()`       | Get abbreviation (EST, PST, etc.) | `getTimezoneAbbreviation("America/New_York")` → `"EST"` |
| `getTimezoneList()`               | Get all common timezones          | For dropdowns/pickers                                   |
| `getTimezoneDisplayName()`        | Get friendly name                 | `"Eastern Time (US & Canada)"`                          |

### EventTimezoneHelpers

| Method               | Description                           |
| -------------------- | ------------------------------------- |
| `formatEventTime()`  | Format with optional user timezone    |
| `isEventSoon()`      | Check if event is within 24 hours     |
| `isEventHappening()` | Check if event is currently happening |

## Best Practices

### ✅ DO

1. **Always store UTC in database**

    ```typescript
    // Correct: Store UTC
    dateTime: new Date('2026-07-15T22:00:00Z');
    ```

2. **Store timezone separately**

    ```typescript
    venueTimezone: 'America/New_York';
    ```

3. **Convert for display only**

    ```typescript
    const display = formatInTimezone(event.dateTime, event.venueTimezone);
    ```

4. **Validate timezone identifiers**

    ```typescript
    if (!isValidTimezone(timezone)) throw new Error('Invalid timezone');
    ```

5. **Show both event and user time**
    ```typescript
    EventTimezoneHelpers.formatEventTime(date, eventTz, userTz);
    ```

### ❌ DON'T

1. **Don't store local times**

    ```typescript
    // Wrong: Don't store timezone-specific times
    dateTime: '2026-07-15 18:00:00 EST';
    ```

2. **Don't use abbreviations**

    ```typescript
    // Wrong: Use IANA identifiers instead
    timezone: 'PST';
    ```

3. **Don't assume UTC everywhere**

    ```typescript
    // Wrong: Always specify timezone
    display = date.toString();
    ```

4. **Don't convert before storing**
    ```typescript
    // Wrong: Store UTC, convert on display
    const localTime = convertToLocal(utcTime);
    await save(localTime);
    ```

## Production Recommendations

### 1. Use a Timezone Service

For production, replace the simple `detectTimezoneFromCoordinates()` with a proper service:

- **Google Maps Timezone API** - Accurate, paid
- **TimeZoneDB API** - Good accuracy, has free tier
- **geo-tz npm package** - Offline, include in bundle

### 2. Cache Timezone Data

```typescript
// Cache user's timezone in Redis or in-memory
const userTimezone = await cache.get(`user:${userId}:timezone`);
```

### 3. Handle Edge Cases

- Users traveling across timezones
- Events spanning multiple days
- Daylight saving time transitions
- International date line crossings

### 4. Testing

Test with various scenarios:

- Same timezone (NYC event, NYC user)
- Different timezone (Tokyo event, NYC user)
- During DST transitions
- Events at midnight
- Multi-day events

## Migration Notes

The timezone migration adds:

- `timezone` field to `users` table (nullable)
- `venueTimezone` field to `events` table (required, defaults to 'UTC')

For existing events, you should:

1. Run the migration (adds fields with defaults)
2. Backfill `venueTimezone` based on venue coordinates or address
3. Update application code to always set timezone when creating events

```bash
# Run migration
cd packages/database
pnpm prisma migrate deploy

# Regenerate client
pnpm prisma generate
```

## Further Reading

- [IANA Time Zone Database](https://www.iana.org/time-zones)
- [MDN: Intl.DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat)
- [PostgreSQL: Date/Time Types](https://www.postgresql.org/docs/current/datatype-datetime.html)
- [Moment Timezone](https://momentjs.com/timezone/) (if using Moment.js)
- [date-fns-tz](https://github.com/marnusw/date-fns-tz) (if using date-fns)
