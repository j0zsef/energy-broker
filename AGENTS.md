# API Route Structure

Routes are auto-loaded by `@fastify/autoload` from `apps/api/src/routes/v1/`. Follow these conventions:

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

# Mock Green Button Server Structure

The mock server (`apps/mock-green-button-server/src/`) is separated by concern:

- `main.ts` — Server boot only (Express + OAuth2 server startup, CORS, mounts routers)
- `mock-oauth/` — OAuth token proxy and token validation middleware
- `mock-green-button-api/` — ESPI Atom XML endpoints and mock response data

<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

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