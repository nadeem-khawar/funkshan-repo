# Funkshan Repository

A modern monorepo workspace powered by pnpm.

## Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0

## Getting Started

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Start development servers:

   ```bash
   # Start both web and API concurrently
   pnpm dev

   # Or start them individually
   pnpm dev:web    # Next.js at http://localhost:3000
   pnpm dev:api    # Fastify API at http://localhost:3001
   ```

3. Visit the applications:
   - **Web App**: http://localhost:3000
   - **API Docs**: http://localhost:3001/docs
   - **API Health**: http://localhost:3001/health

## Workspace Structure

```
├── apps/
│   ├── funkshan-web/         # Next.js web application (http://localhost:3000)
│   └── funkshan-api/         # Fastify API server (http://localhost:3001)
├── packages/                 # Shared packages
├── package.json              # Root package.json (workspace configuration)
├── pnpm-workspace.yaml       # pnpm workspace configuration
└── pnpm-lock.yaml           # Lockfile
```

## Available Scripts

### Development

- `pnpm dev` - Start both web and API servers concurrently
- `pnpm dev:web` - Start only the Next.js web app (port 3000)
- `pnpm dev:api` - Start only the Fastify API server (port 3001)
- `pnpm dev:all` - Start all apps individually (alternative to concurrent)

### Production

- `pnpm start` - Start both web and API in production mode
- `pnpm start:web` - Start only the web app in production
- `pnpm start:api` - Start only the API server in production

### Building

- `pnpm build` - Build all apps and packages
- `pnpm build:web` - Build only the web application
- `pnpm build:api` - Build only the API server

### Code Quality

- `pnpm lint` - Lint all packages
- `pnpm lint:fix` - Fix linting issues
- `pnpm format` - Format all files with Prettier
- `pnpm format:check` - Check if files are formatted correctly
- `pnpm format:workspace` - Format files in all workspace packages
- `pnpm test` - Run tests across all packages
- `pnpm clean` - Clean build artifacts
- `pnpm type-check` - Run TypeScript type checking

## Package Management

This project uses pnpm workspaces. To add dependencies:

```bash
# Add to workspace root
pnpm add -w <package>

# Add to specific workspace
pnpm add <package> --filter <workspace-name>

# Add dev dependency to specific workspace
pnpm add -D <package> --filter <workspace-name>
```

## Version Management

This project uses [Changesets](https://github.com/changesets/changesets) for version management:

```bash
# Create a changeset
pnpm changeset

# Version packages
pnpm version-packages

# Publish packages
pnpm release
```

## Development

1. Each package should have its own `package.json` with appropriate scripts
2. Use relative imports between packages in the workspace
3. Follow the established code style (see `.editorconfig` and `.prettierrc.json`)
4. Format code with `pnpm format` before committing
5. Write tests for new features
6. Create changesets for notable changes

## Code Formatting

This project uses [Prettier](https://prettier.io/) for consistent code formatting:

- Configuration is in `.prettierrc.json`
- Files to ignore are listed in `.prettierignore`
- VS Code is configured to format on save (see `.vscode/settings.json`)
- Run `pnpm format` to format all files
- Run `pnpm format:check` to verify formatting

## License

ISC
