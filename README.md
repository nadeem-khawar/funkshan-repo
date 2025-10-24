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

2. Start development:
   ```bash
   pnpm dev
   ```

## Workspace Structure

```
├── apps/
│   └── funkshan-web/         # Next.js web application
├── packages/                 # Shared packages
├── package.json              # Root package.json (workspace configuration)
├── pnpm-workspace.yaml       # pnpm workspace configuration
└── pnpm-lock.yaml           # Lockfile
```

## Available Scripts

- `pnpm dev` - Start development servers for all apps
- `pnpm build` - Build all apps and packages
- `pnpm lint` - Lint all packages
- `pnpm lint:fix` - Fix linting issues
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
3. Follow the established code style (see `.editorconfig`)
4. Write tests for new features
5. Create changesets for notable changes

## License

ISC