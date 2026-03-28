[![CI](https://github.com/j0zsef/energy-broker/actions/workflows/ci.yml/badge.svg)](https://github.com/j0zsef/energy-broker/actions/workflows/ci.yml)
[![codecov](https://codecov.io/github/j0zsef/energy-broker/graph/badge.svg?token=WRIRGIAHQ1)](https://codecov.io/github/j0zsef/energy-broker)

# energy-broker
Broker your personal energy. Save money on utilities, search for sustainable alternatives, and access the carbon market.

## Installation

```bash
pnpm install
```

## Local Development

Spin up full stack (frontend, API, and MySQL via Docker):
```bash
pnpm start-dev
```

Spin up the frontend and API only (assumes DB is already running):
```bash
pnpm serve
```

### Environment Variables

Copy `.env.example` to `.env` and fill in the values. Key variables:

| Variable | Description |
|---|---|
| `AUTH0_DOMAIN` | Auth0 tenant domain |
| `AUTH0_CLIENT_ID` | Auth0 application client ID |
| `AUTH0_CLIENT_SECRET` | Auth0 application client secret |
| `SESSION_SECRET` | Secret for signing session cookies (32+ chars) |
| `FRONTEND_URL` | Frontend origin (`http://localhost:9200` locally) |
| `API_BASE_URL` | API origin (`http://localhost:9400` locally) |
| `DATABASE_URL` | MySQL connection string |
| `GREEN_BUTTON_TOKEN` | Green Button sandbox API token |
| `VITE_API_BASE_URL` | API base URL for the frontend |

## Auth

Uses [Auth0](https://auth0.com/) with a **Backend-for-Frontend (BFF) pattern** — all OAuth token handling happens on the Fastify API. The browser never sees or stores any tokens; auth state is maintained via HttpOnly session cookies.

### How it works

1. Frontend calls `GET /v1/auth/login` — API returns an Auth0 authorization URL
2. User authenticates at Auth0 — Auth0 redirects to the API callback
3. API exchanges the authorization code for tokens (PKCE), stores them in a server-side session, and redirects the user to the frontend with an HttpOnly cookie
4. All subsequent API calls include the session cookie — no Bearer tokens in the browser

### Energy Provider OAuth

Energy provider (Green Button) OAuth also runs server-side:

1. Frontend calls `POST /v1/energy-providers/authorize` with a provider ID
2. API returns the provider's authorization URL
3. Provider redirects back to the API, which exchanges the code for tokens and saves the connection
4. User is redirected to the frontend connections page

## App Structure

```
/apps
├── api/                          # Fastify 5 API (Node ESM)
│   └── src/
│       ├── config/               # OIDC and API configuration
│       ├── plugins/              # Fastify plugins (session auth)
│       ├── routes/v1/            # Auto-loaded route files
│       │   ├── auth/             # Login, callback, logout, me
│       │   ├── connections/      # Usage and summary endpoints
│       │   └── energy-providers/ # Provider listing, authorize, OAuth callback
│       ├── types/                # Fastify type augmentations
│       └── utils/                # Prisma client, session store
├── frontend/                     # React 18 + Vite
│   └── src/
│       ├── auth/                 # Auth context (session-based)
│       └── routes/               # TanStack Router file-based routes
└── mock-green-button-server/     # Mock OAuth + Green Button API (ports 9500-9501)

/libs
├── components/                   # Shared React UI components (React Bootstrap)
├── services/
│   ├── api-client/               # Frontend HTTP client (fetch + TanStack Query)
│   └── green-button-client/      # Green Button XML parser
├── shared/                       # Common TypeScript types (DTOs, session types)
└── stores/                       # Zustand stores
```

## Database

MySQL 9 (Docker) + Prisma ORM. Schema at `/prisma/schema.prisma`.

Models: `OAuthProviderConfig`, `EnergyProvider`, `EnergyProviderLocation`, `EnergyProviderConnection`, `Session`.

```bash
pnpm db-setup       # Start MySQL Docker, run migrations, seed
pnpm db-reset       # Tear down and recreate from scratch
pnpm prisma-studio  # Open Prisma Studio web UI
```
