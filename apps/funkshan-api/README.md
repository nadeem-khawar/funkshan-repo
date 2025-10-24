# Funkshan API

A RESTful API server built with Fastify and TypeScript.

## Features

- **Fastify 5.6.1** - Fast and low overhead web framework
- **TypeScript** - Type-safe development with strict configuration
- **Plugin Architecture** - Modular and organized plugin system
- **MongoDB & Mongoose** - Database integration with ODM
- **Security** - Helmet, CORS, Rate limiting, JWT authentication
- **API Documentation** - Swagger/OpenAPI with interactive UI
- **Environment Config** - Validated environment variables with @fastify/env
- **Rate Limiting** - Request throttling and connection limits
- **Logging** - Structured logging with Pino
- **Hot Reload** - Development with tsx watch

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- MongoDB >= 5.0 (local installation or MongoDB Atlas)

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

### Available Scripts

- `pnpm dev` - Start development server with hot reload
- `pnpm build` - Build TypeScript to JavaScript
- `pnpm start` - Start production server
- `pnpm clean` - Clean build directory
- `pnpm lint` - Lint TypeScript files
- `pnpm lint:fix` - Fix linting issues
- `pnpm format` - Format code with Prettier
- `pnpm type-check` - Run TypeScript type checking

## API Documentation

Once the server is running, visit:

- **Swagger UI**: http://localhost:3001/docs
- **OpenAPI JSON**: http://localhost:3001/docs/json

## Endpoints

### Health Checks

- `GET /health` - Basic health check
- `GET /health/ready` - Readiness check (includes database status)
- `GET /health/db` - Database connection health check

### API

- `GET /api/v1` - API information
- `POST /api/v1/echo` - Echo endpoint for testing

### Users (Example MongoDB Integration)

- `GET /api/v1/users` - Get all users
- `POST /api/v1/users` - Create a new user
- `GET /api/v1/users/:id` - Get user by ID

## Environment Variables

Copy `.env.example` to `.env` and configure as needed:

```bash
cp .env.example .env
```

### Available Variables:

- `NODE_ENV` - Environment (development/production, default: development)
- `PORT` - Server port (default: 3001)
- `HOST` - Server host (default: 0.0.0.0)
- `LOG_LEVEL` - Logging level (default: info)
- `JWT_SECRET` - Secret key for JWT tokens
- `CORS_ORIGINS` - Allowed origins for CORS (default: http://localhost:3000)
- `MONGODB_URL` - MongoDB connection string (default: mongodb://localhost:27017/funkshan)

## Project Structure

```
src/
├── plugins/         # Fastify plugins (modular architecture)
│   ├── index.ts     # Plugin exports
│   ├── config.ts    # Environment configuration
│   ├── database.ts  # MongoDB/Mongoose connection
│   ├── security.ts  # Security middleware (CORS, Helmet)
│   ├── rate-limiting.ts # Rate limiting and throttling
│   ├── documentation.ts # Swagger/OpenAPI setup
│   └── authentication.ts # JWT authentication
├── models/          # Mongoose models
│   ├── index.ts     # Model exports
│   └── User.ts      # User model (example)
├── routes/          # Route handlers
│   ├── health.ts    # Health check routes
│   └── api.ts       # API routes (includes user CRUD)
├── app.ts           # Fastify app setup (lean, plugin-based)
└── server.ts        # Server entry point
```

### Plugin Architecture

The API uses a modular plugin architecture:

1. **Config Plugin** - Validates and loads environment variables
2. **Database Plugin** - Manages MongoDB connection with Mongoose
3. **Security Plugin** - Registers CORS, Helmet, and Sensible utilities
4. **Rate Limiting Plugin** - Implements request throttling and connection limits
5. **Documentation Plugin** - Sets up Swagger UI and OpenAPI specification
6. **Authentication Plugin** - Handles JWT tokens and authentication decorators

### Database Integration

The API uses **Mongoose** for MongoDB integration:

- **Connection Management**: Automatic connection handling with reconnection logic
- **Type Safety**: TypeScript interfaces for all models
- **Schema Validation**: Built-in validation and type checking
- **Health Checks**: Database connectivity monitoring
- **Graceful Shutdown**: Proper cleanup on application exit

#### Example Model Usage:

```typescript
import { User } from '../models';

// Create a user
const user = new User({ email: 'user@example.com', name: 'John Doe' });
await user.save();

// Find users
const users = await User.find().sort({ createdAt: -1 });
```

## Development

1. Make changes to TypeScript files in `src/`
2. The server will automatically reload
3. Visit http://localhost:3001/docs to test API endpoints
4. Use `pnpm lint` and `pnpm format` before committing

## Production Deployment

1. Build the application: `pnpm build`
2. Start the server: `pnpm start`
3. Configure environment variables as needed
4. Set up process manager (PM2, systemd, etc.)
