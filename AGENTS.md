# AGENTS.md

Instructions for AI coding agents working in this repository. For project overview, auth flows, app structure, database, and environment variables, see [README.md](./README.md).

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

## Architecture Details

### Key Implementation Details

- **apps/api** — Fastify 5 backend (Node ESM). Entry: `server.ts` → `app.ts`. Routes autoloaded from `routes/v1/` via `@fastify/autoload`.
- **apps/frontend** — React 18 + Vite. Uses TanStack Router (file-based routing in `src/routes/`). Auto-generated route tree at `routeTree.gen.ts`.
- **libs/services/api-client** — Frontend HTTP client (`fetch` wrapper with `credentials: 'include'`). Wraps TanStack React Query.
- **libs/services/green-button-client** — Green Button Data XML parser. Factory pattern: `GreenButtonFactory.create(provider, baseUrl)`.
- **libs/shared** — Common TypeScript types/interfaces (DTOs, schemas, session types)
- **libs/stores** — Zustand state stores (currently empty — auth state moved server-side)

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

### Auth Key Files

- `apps/api/src/routes/v1/auth/auth.ts` — Login, callback, logout, and me routes
- `apps/api/src/plugins/session-auth.ts` — `fastify.requireSession()` guard
- `apps/api/src/config/oidc-config.ts` — Auth0 OIDC discovery via `openid-client`
- `apps/api/src/utils/prisma-session-store.ts` — Prisma-backed session store for `@fastify/session`
- `apps/api/src/types/session.ts` — Fastify session type augmentation (extends `SessionData` from `@energy-broker/shared`)
- `apps/frontend/src/auth/auth0.tsx` — `Auth0Wrapper` context (calls `/v1/auth/me` on mount, exposes `login`/`logout`)

**Session infrastructure:** `@fastify/cookie` + `@fastify/session` with a custom Prisma store. Sessions stored in the `Session` DB table. `@fastify/helmet` provides CSP headers. `openid-client` v6 (function-based API, not class-based).

## API Route Structure

Routes are autoloaded by `@fastify/autoload` from `apps/api/src/routes/v1/`. Follow these conventions:

- **One route per file.** Each file exports a single Fastify route plugin (default export async function).
- Routes are grouped by domain into subdirectories:
  ```
  routes/v1/
  ├── auth/               # Auth0 login, callback, logout, me
  ├── connections/         # Usage and summary for energy connections
  └── energy-providers/    # Provider listing, OAuth authorize/callback
  ```
- File names match the route path segment (e.g., `login.ts` → `GET /login`, `authorize.ts` → `POST /authorize`).
- Fastify autoload maps directory structure to URL prefixes automatically — do not hardcode prefixes in route files.
- Session-protected routes use `preHandler: fastify.requireSession()`.

## Mock Green Button Server Structure

The mock server (`apps/mock-green-button-server/src/`) is separated by concern:

- `main.ts` — Server boot only (Express + OAuth2 server startup, CORS, mounts routers)
- `mock-oauth/` — OAuth token proxy and token validation middleware
- `mock-green-button-api/` — ESPI Atom XML endpoints and mock response data

## Styling

- **Dedicated SCSS files** — every component gets a colocated `.scss` file (e.g., `my-component.tsx` + `my-component.scss`). Never use inline `style={{ }}` attributes or className-only utility overloads for layout/sizing. Bootstrap utility classes (`mb-3`, `g-3`, `text-center`) are acceptable for simple spacing on container elements, but visual styling (colors, borders, shadows, transitions, responsive breakpoints) must go in SCSS.
- **BEM naming** — `.block__element--modifier` convention (e.g., `.stat-card__value`, `.project-card--selected`).
- **Bootstrap CSS variables** — use `var(--bs-*)` tokens for colors, borders, and backgrounds. Never hardcode hex values that duplicate Bootstrap theme tokens.
- **Dark mode** — support via `[data-bs-theme='dark'] &` selector when overriding backgrounds or shadows.
- **Responsive** — mobile-first, use `@media (min-width: 768px)` for desktop overrides. Tables use the responsive pattern: hide table on mobile, show stacked cards instead (see `energy-connections.scss`, `carbon-credits-table.scss`).
- **Transitions** — `0.15s ease` for standard interactions, `0.2s ease` for brand/filter effects.
- **Shared components** — reusable UI primitives live in `libs/components/src/lib/shared/` (e.g., `StatCard`, `PageSpinner`, `DeltaBadge`). Extract shared patterns rather than duplicating SCSS across feature components.
- **SCSS variables** — Bootstrap theme overrides live in `apps/frontend/src/styles/_variables.scss`, imported before Bootstrap in `root.scss`.

## Code Style & Linting

- **ESLint flat config** (`eslint.config.mjs`) with `@stylistic` plugin for formatting
- **Semicolons required** (`@stylistic/semi: ['error', 'always']`)
- **Imports must be sorted** (`sort-imports` rule — alphabetical, case-sensitive)
- **Object keys must be sorted** (`sort-keys` rule — ascending, case-sensitive)
- TypeScript strict mode enabled
- React does not require `import React` (react-in-jsx-scope off)
- Node ESM: backend uses `.js` extensions in relative imports (e.g., `./config/auth-config.js`)

## Testing Conventions

### Frameworks
- **API routes** — Jest. Tests colocated next to route files (e.g., `usage.spec.ts` beside `usage.ts`).
- **Libs** (`components`, `api-client`, `green-button-client`) — Jest. Tests colocated in the same directory as the source file.
- **Frontend** — Vitest (configured in `vite.config.ts`). No test files yet; `passWithNoTests: true` is set.
- **E2E** — Cypress (`apps/frontend-e2e`). Page objects in `src/support/app.po.ts`, custom commands in `src/support/commands.ts`.

### API Route Testing Pattern
Tests spin up a real Fastify instance with Zod validation, mock Prisma and external clients, then use `app.inject()` for HTTP assertions. Pattern:
1. `jest.mock()` Prisma client and any external clients (e.g., `GreenButtonFactory`) **before** imports
2. Build a Fastify app with `setValidatorCompiler`/`setSerializerCompiler` and decorate with a stub `requireSession`
3. Register the route under test
4. Assert with `app.inject({ method, url })` — check `statusCode` and `JSON.parse(res.body)`

### E2E Testing Pattern
All API calls are intercepted with `cy.intercept()` — no real backend needed. Custom Cypress commands (`cy.mockAuth()`, `cy.mockConnections()`, `cy.mockProviders()`) set up common intercepts. Page objects abstract DOM queries.

## Prisma Workflow

- **Schema-first**: Edit `/prisma/schema.prisma`, then run `pnpm prisma-migrate` to generate a migration and update the client.
- **After schema changes**: Always run `pnpm prisma-generate` to regenerate the Prisma client types.
- **In tests**: Mock `prismaClient` with `jest.mock()` — never connect to a real database in unit tests.
- **Seed data**: `/prisma/seed.ts` runs via `pnpm db-seed` (called automatically by `db-setup`).
- **Prisma client singleton**: Imported from `apps/api/src/utils/prisma-client.ts` — do not instantiate `new PrismaClient()` elsewhere.

## Frontend Patterns

- **Routing**: TanStack Router with file-based routing. Route files in `apps/frontend/src/routes/`. The route tree is auto-generated at `routeTree.gen.ts` — never edit it manually.
- **Data fetching**: TanStack Query hooks live in `libs/services/api-client/src/lib/hooks/`. Each hook calls the `apiClient` fetch wrapper with `credentials: 'include'`.
- **Forms**: TanStack Form for form state and validation.
- **UI components**: React Bootstrap + SCSS in `libs/components/`. Keep components reusable and decoupled from route-specific logic.
- **State management**: Server state via TanStack Query. Client state via Zustand (`libs/stores/`) when needed. Avoid duplicating server state in client stores.
- **Code splitting**: TanStack Router's `autoCodeSplitting: true` handles route-level splits automatically.

## Security Posture

These protections are already in place. Do not weaken or bypass them:

- **`@fastify/helmet`** — Sets CSP, X-Frame-Options, and other security headers. Configured in `app.ts`.
- **`@fastify/cors`** — Restricts origins to `FRONTEND_URL`. Do not set `origin: '*'`.
- **HttpOnly session cookies** — All auth tokens are server-side. Never expose tokens to the browser or add `Authorization` headers from the frontend.
- **Zod request validation** — All route inputs are validated with Zod schemas via `fastify-type-provider-zod`. Always define schemas for new routes; never trust raw `request.body`/`request.params`.
- **`fastify.requireSession()`** — Per-route guard that rejects unauthenticated requests with 401. Apply to all routes that need auth.
- **PKCE** — Auth0 authorization code flow uses PKCE. Do not downgrade to implicit or plain code flow.
- **Parameterized queries** — Prisma handles SQL parameterization. Never use raw SQL string interpolation.

## Key Constraints

- **Node >= 24.0.0**, **pnpm >= 9.0.0**
- Backend is **ESM** — use `import.meta.url` instead of `__dirname`, and `.js` extensions on relative imports
- **CJS dependencies in ESM** — some npm packages (e.g., `@patch-technology/patch`) are CommonJS. When importing a CJS module that uses `exports.default`, Node's ESM loader wraps `module.exports` as the default import, so `import Foo from 'cjs-pkg'` may yield `{ default: Foo }` instead of `Foo`. Use the runtime interop pattern: `const Foo = FooModule.default ?? FooModule;`. If the package has no type declarations, suppress with `// @ts-expect-error` on the import — do **not** add `.d.ts` declaration files.
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
