# @funkshan/email

Email service and templates for Funkshan using Resend and Handlebars.

## Features

- 📧 **Resend Integration** - Reliable email delivery
- 🎨 **Handlebars Templates** - Flexible, maintainable templates
- 🔒 **Type-Safe** - Full TypeScript support
- 📦 **Reusable** - Shared across worker and API
- 🎯 **Pre-built Templates** - Event invitations, updates, auth emails

## Installation

This package is part of the Funkshan monorepo and uses workspace dependencies.

## Environment Variables

```bash
RESEND_API_KEY=re_xxxxx           # Required: Resend API key
EMAIL_FROM=noreply@funkshan.com   # Optional: Default from address
WEB_APP_URL=https://app.funkshan.com  # Optional: For links in emails
```

## Usage

### Send Event Invitation

```typescript
import { sendInvitationEmail } from '@funkshan/email';

await sendInvitationEmail({
    guestName: 'John Doe',
    eventName: 'Birthday Party',
    eventDateTime: '2026-02-15 at 7:00 PM',
    venueAddress: '123 Main St, New York, NY',
    venueTimezone: 'America/New_York',
    hostName: 'Jane Smith',
    dressCode: 'Casual',
    rsvpUrl: 'https://app.funkshan.com/rsvp/token123',
    acceptUrl: 'https://app.funkshan.com/rsvp/token123?action=accept',
    declineUrl: 'https://app.funkshan.com/rsvp/token123?action=decline',
    entryCode: '123456',
});
```

### Send Event Update

```typescript
import { sendEventUpdateEmail } from '@funkshan/email';

await sendEventUpdateEmail('guest@example.com', {
    guestName: 'John Doe',
    eventName: 'Birthday Party',
    hostName: 'Jane Smith',
    changedFields: ['Date & Time', 'Location'],
    newDateTime: '2026-02-20 at 8:00 PM',
    newVenueAddress: '456 Oak Ave, New York, NY',
    rsvpUrl: 'https://app.funkshan.com/rsvp/token123',
});
```

### Batch Sending

```typescript
import { sendInvitationEmailsBatch } from '@funkshan/email';

const invitations = [
    { guestName: 'John', eventName: 'Party', ... },
    { guestName: 'Jane', eventName: 'Party', ... },
];

const results = await sendInvitationEmailsBatch(invitations);
```

### Custom Email

```typescript
import { getEmailClient } from '@funkshan/email';

const client = getEmailClient();

await client.send({
    to: 'user@example.com',
    subject: 'Welcome!',
    html: '<h1>Hello World</h1>',
    tags: [{ name: 'type', value: 'welcome' }],
});
```

## Templates

Templates are located in `src/templates/`:

- `layout.hbs` - Base layout wrapper
- `invitation.hbs` - Event invitation
- `event-update.hbs` - Event update notification

### Adding New Templates

1. Create template file: `src/templates/my-template.hbs`
2. Add template function in `src/templates.ts`
3. Add service function in `src/service.ts`
4. Export from `src/index.ts`

## Development

```bash
# Build
pnpm run build

# Watch mode
pnpm run dev

# Type check
pnpm run type-check
```

## Testing Templates

You can render templates without sending to preview HTML:

```typescript
import { renderInvitationEmail } from '@funkshan/email';

const html = renderInvitationEmail({
    guestName: 'John Doe',
    // ... other data
});

console.log(html); // See HTML output
```
