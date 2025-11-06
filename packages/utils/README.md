# @funkshan/utils

Shared utility functions and helpers for the Funkshan monorepo.

## Purpose

This package contains common utility functions that can be used across both frontend and backend applications to avoid code duplication.

## Features

- **Date Utilities**: Date formatting, validation, and manipulation
- **String Utilities**: String formatting, capitalization, truncation, slugification
- **Object Utilities**: Deep cloning, picking, omitting, merging objects

## Usage

### Date Utilities

```typescript
import { formatDate, isValidDate, addDays } from '@funkshan/utils';

const date = new Date();
const formatted = formatDate(date); // "2025-10-25"
const nextWeek = addDays(date, 7);
const isValid = isValidDate(date); // true
```

### String Utilities

```typescript
import { capitalize, truncate, slugify } from '@funkshan/utils';

const title = capitalize('hello world'); // "Hello world"
const short = truncate('Long text here', 10); // "Long te..."
const slug = slugify('Hello World!'); // "hello-world"
```

### Object Utilities

```typescript
import { pick, omit, deepClone } from '@funkshan/utils';

const obj = { a: 1, b: 2, c: 3 };
const picked = pick(obj, ['a', 'b']); // { a: 1, b: 2 }
const omitted = omit(obj, ['c']); // { a: 1, b: 2 }
const cloned = deepClone(obj);
```

## Development

```bash
# Build the package
pnpm build

# Watch mode for development
pnpm dev

# Type check
pnpm type-check

# Clean build artifacts
pnpm clean
```
