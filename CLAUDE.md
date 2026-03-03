# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Energy Broker is a full-stack app for brokering personal energy — saving on utilities, finding sustainable alternatives, and accessing the carbon market. Built as an Nx monorepo with a React frontend and Fastify API backend.

## Common Commands

```bash
pnpm install                    # Install dependencies
pnpm start-dev                  # Full stack: frontend + API + MySQL (Docker)
pnpm serve                      # Frontend + API only (no DB setup)
pnpm build                      # Build all projects
pnpm test                       # Run all unit tests
pnpm lint                       # Lint all projects
nx run <project>:test           # Run tests for a single project
nx run <project>:lint           # Lint a single project
nx run <project>:typecheck      # Typecheck a single project
```

**Database:**
```bash
pnpm db-setup                   # Start MySQL Docker, migrate, seed
pnpm db-reset                   # Tear down and recreate DB from scratch
pnpm prisma-migrate             # Run Prisma migrations (prisma migrate dev)
pnpm prisma-generate            # Regenerate Prisma client after schema changes
pnpm prisma-studio              # Open Prisma Studio web UI
```

**Nx project names:** `api`, `frontend`, `api-e2e`, `frontend-e2e`, `components`, `api-client`, `green-button-client`, `shared`, `stores`

## Architecture

### Monorepo Layout
- **apps/api** — Fastify 5 backend (Node ESM). Entry: `server.ts` → `app.ts`. Routes auto-loaded from `routes/v1/` via `@fastify/autoload`.
- **apps/frontend** — React 18 + Vite. Uses TanStack Router (file-based routing in `src/routes/`). Auto-generated route tree at `routeTree.gen.ts`.
- **libs/components** — Shared React UI components (React Bootstrap + SCSS)
- **libs/services/api-client** — Frontend HTTP client (Axios). Injects Auth0 token via `setAuthTokenGetter()`. Wraps TanStack React Query.
- **libs/services/green-button-client** — Green Button Data XML parser. Factory pattern: `GreenButtonFactory.create(provider, baseUrl)`.
- **libs/shared** — Common TypeScript types/interfaces (DTOs, schemas)
- **libs/stores** — Zustand state stores
- **apps/mock-green-button-server** — Mock OAuth server for local testing

### Auth
Auth0 on both sides:
- **Frontend:** `Auth0Provider` wrapper in `src/auth/auth0.tsx` with custom context. Config from `VITE_AUTH0_*` env vars.
- **Backend:** `@auth0/auth0-fastify-api` plugin registered in `app.ts`. Routes use `fastify.requireAuth()` guards.

### Database
MySQL 9 (Docker) + Prisma ORM. Schema at `/prisma/schema.prisma`. Models: `OAuthProviderConfig`, `EnergyProvider`, `EnergyProviderLocation`, `EnergyProviderConnection`. Seed script at `/prisma/seed.ts`.

### Request Validation
Fastify uses `fastify-type-provider-zod` — Zod schemas define request/response types with automatic TypeScript inference.

### Import Aliases
```
@energy-broker/components
@energy-broker/shared
@energy-broker/api-client
@energy-broker/green-button-client
@energy-broker/stores
```

## Code Style & Linting

- **ESLint flat config** (`eslint.config.mjs`) with `@stylistic` plugin for formatting
- **Semicolons required** (`@stylistic/semi: ['error', 'always']`)
- **Imports must be sorted** (`sort-imports` rule — alphabetical, case-sensitive)
- **Object keys must be sorted** (`sort-keys` rule — ascending, case-sensitive)
- TypeScript strict mode enabled
- React does not require `import React` (react-in-jsx-scope off)
- Node ESM: backend uses `.js` extensions in relative imports (e.g., `./config/auth-config.js`)

## Key Constraints

- **Node >= 24.0.0**, **pnpm >= 9.0.0**
- Backend is **ESM** — use `import.meta.url` instead of `__dirname`, and `.js` extensions on relative imports
- Prisma schema lives at repo root `/prisma/`, not inside any app
- Environment variables: API uses `process.env.*`, frontend uses `import.meta.env.VITE_*`


<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

## General Guidelines for working with Nx

- For navigating/exploring the workspace, invoke the `nx-workspace` skill first - it has patterns for querying projects, targets, and dependencies
- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- Prefix nx commands with the workspace's package manager (e.g., `pnpm nx build`, `npm exec nx test`) - avoids using globally installed CLI
- You have access to the Nx MCP server and its tools, use them to help the user
- For Nx plugin best practices, check `node_modules/@nx/<plugin>/PLUGIN.md`. Not all plugins have this file - proceed without it if unavailable.
- NEVER guess CLI flags - always check nx_docs or `--help` first when unsure

## Scaffolding & Generators

- For scaffolding tasks (creating apps, libs, project structure, setup), ALWAYS invoke the `nx-generate` skill FIRST before exploring or calling MCP tools

## When to use nx_docs

- USE for: advanced config options, unfamiliar flags, migration guides, plugin configuration, edge cases
- DON'T USE for: basic generator syntax (`nx g @nx/react:app`), standard commands, things you already know
- The `nx-generate` skill handles generator discovery internally - don't call nx_docs just to look up generator syntax


<!-- nx configuration end-->