# energy-broker
Broker your personal energy. Save money on utilities, search for sustainable alternatives, and access the carbon market.

## Installation

```bash
pnpm install
```

## Local Development

Spin up full stack (frontend, api, and db):
```bash
pnpm start-dev
```

Spin up the frontend and api:
```bash
pnpm serve
```

## Local Auth Setup

Uses Auth0 for authentication. Need to add users in Auth0 dashboard. However, the `TBD` user is pre-configured for local development.

## App Structure

```
/apps
├── frontend/         # React frontend
├── api/              # Fastify API

/libs
├── backend/          # Backend utilities (DB, auth, etc.)
├── components/       # Frontend components (UI library)
├── services/         # Domain-specific services (external API clients, etc.)
│   ├── green-button-client/
│   ├── api-client/
│   ├── recommendations-service/
├── shared/           # Common configs & types (e.g., DTOs, schemas)
```

## DB

The app uses Prisma with a MySQL DB. The database connection URL is configured via the `DATABASE_URL` environment variable in `libs/backend/.env`.

For development: apply migrations, create the database schema, and run the DB in docker:
```bash
pnpm db-setup
```
