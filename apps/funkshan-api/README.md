# Funkshan API

A RESTful API server built with Fastify and TypeScript.

## Features

- **Fastify 5.6.1** - Fast and low overhead web framework
- **TypeScript** - Type-safe development
- **Swagger/OpenAPI** - API documentation
- **Security** - Helmet, CORS, Rate limiting
- **Logging** - Structured logging with Pino
- **Hot Reload** - Development with tsx watch

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0

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
- `GET /health/ready` - Readiness check

### API

- `GET /api/v1` - API information
- `POST /api/v1/echo` - Echo endpoint for testing

## Environment Variables

- `PORT` - Server port (default: 3001)
- `HOST` - Server host (default: 0.0.0.0)
- `NODE_ENV` - Environment (development/production)

## Project Structure

```
src/
├── routes/          # Route handlers
│   ├── health.ts    # Health check routes
│   └── api.ts       # API routes
├── plugins/         # Fastify plugins
├── app.ts           # Fastify app setup
└── server.ts        # Server entry point
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
