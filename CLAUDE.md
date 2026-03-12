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
- **libs/services/api-client** — Frontend HTTP client (`fetch` wrapper with `credentials: 'include'`). Wraps TanStack React Query.
- **libs/services/green-button-client** — Green Button Data XML parser. Factory pattern: `GreenButtonFactory.create(provider, baseUrl)`.
- **libs/shared** — Common TypeScript types/interfaces (DTOs, schemas, session types)
- **libs/stores** — Zustand state stores (currently empty — auth state moved server-side)
- **apps/mock-green-button-server** — Mock OAuth + Green Button API server for local testing

### Auth (BFF Pattern)
All OAuth token handling lives in the Fastify backend. The browser never sees or stores any tokens — auth state is maintained via HttpOnly session cookies.

**How it works:**
1. Frontend calls `GET /v1/auth/login` → backend returns Auth0 authorization URL
2. User authenticates at Auth0 → Auth0 redirects to `GET /v1/auth/callback` on the API
3. Backend exchanges the authorization code for tokens via `openid-client` (PKCE), stores them in a server-side session (Prisma-backed `Session` table), and redirects the user to the frontend with an HttpOnly session cookie
4. All subsequent API calls include the session cookie (`credentials: 'include'`) — no Bearer tokens in the browser

**Key files:**
- `apps/api/src/routes/v1/auth/auth.ts` — Login, callback, logout, and me routes
- `apps/api/src/plugins/session-auth.ts` — `fastify.requireSession()` guard (replaces old `requireAuth()`)
- `apps/api/src/config/oidc-config.ts` — Auth0 OIDC discovery via `openid-client`
- `apps/api/src/utils/prisma-session-store.ts` — Prisma-backed session store for `@fastify/session`
- `apps/api/src/types/session.ts` — Fastify session type augmentation (extends `SessionData` from `@energy-broker/shared`)
- `apps/frontend/src/auth/auth0.tsx` — `Auth0Wrapper` context (calls `/v1/auth/me` on mount, exposes `login`/`logout`)

**Session infrastructure:** `@fastify/cookie` + `@fastify/session` with a custom Prisma store. Sessions stored in the `Session` DB table. `@fastify/helmet` provides CSP headers.

**Energy provider OAuth** also runs server-side:
1. Frontend calls `POST /v1/energy-providers/authorize` with `energyProviderId`
2. Backend returns the provider's authorization URL (state stored in session)
3. Provider redirects to `GET /v1/energy-providers/callback` on the API
4. Backend exchanges the code for tokens, saves the `EnergyProviderConnection`, and redirects to the frontend

### Database
MySQL 9 (Docker) + Prisma ORM. Schema at `/prisma/schema.prisma`. Models: `OAuthProviderConfig`, `EnergyProvider`, `EnergyProviderLocation`, `EnergyProviderConnection`, `Session`. Seed script at `/prisma/seed.ts`.

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

## Environment Variables

API uses `process.env.*`, frontend uses `import.meta.env.VITE_*`.

| Variable | Used by | Description |
|---|---|---|
| `AUTH0_DOMAIN` | API | Auth0 tenant domain |
| `AUTH0_CLIENT_ID` | API | Auth0 application client ID |
| `AUTH0_CLIENT_SECRET` | API | Auth0 application client secret (keep in vault for prod) |
| `SESSION_SECRET` | API | Secret for signing session cookies (32+ chars, keep in vault for prod) |
| `FRONTEND_URL` | API | Frontend origin for CORS and redirects (`http://localhost:9200` locally) |
| `API_BASE_URL` | API | API origin for OAuth callback URLs (`http://localhost:9400` locally) |
| `DATABASE_URL` | API/Prisma | MySQL connection string |
| `GREEN_BUTTON_TOKEN` | API | Green Button sandbox API token |
| `VITE_API_BASE_URL` | Frontend | API base URL for `api-client` fetch calls |

## Key Constraints

- **Node >= 24.0.0**, **pnpm >= 9.0.0**
- Backend is **ESM** — use `import.meta.url` instead of `__dirname`, and `.js` extensions on relative imports
- Prisma schema lives at repo root `/prisma/`, not inside any app
- **No tokens in the browser** — all OAuth tokens are stored server-side in Prisma sessions. The frontend authenticates via HttpOnly session cookies only.


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