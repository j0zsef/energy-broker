# energy-broker
Broker your personal energy. Save money on utilities, search for sustainable alternatives, and access the carbon market.

## Installation

```bash
pnpm install
```

## Local Development

Spin up front-end and api:
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
├── services/         # Domain-specific services (external API clients, etc.)
│   ├── green-button-client/
│   ├── carbon-credit-service/
│   ├── recommendations-service/
├── shared/           # Common utilities & types (e.g., DTOs, schemas)
```
