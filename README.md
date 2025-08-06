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

## App Structure

```
/apps
├── frontend/         # React frontend
├── api/              # Fastify backend

/libs
├── backend/          # Backend utilities (DB, auth, etc.)
├── components/       # Frontend components (UI library)
├── services/         # Domain-specific services (external API clients, etc.)
│   ├── green-button-client/
│   ├── carbon-credit-service/
│   ├── recommendations-service/
├── shared/           # Common utilities & types (e.g., DTOs, schemas)
```

## DB

The app uses Prisma with a MySQL DB. The database connection URL is configured via the `DATABASE_URL` environment variable in `libs/backend/.env`.

For development: apply migrations, create the database schema, and run the DB in docker:
```bash
pnpm db-setup
```
