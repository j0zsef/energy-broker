/// <reference types="vite/client" />

export const viteEnvVars = {
  apiHost: import.meta.env.VITE_API_HOST || 'localhost',
  apiPort: import.meta.env.VITE_API_PORT ? Number(import.meta.env.VITE_API_PORT) : 3000,
  auth0ClientId: import.meta.env.VITE_AUTH0_CLIENT_ID || '',
  auth0Domain: import.meta.env.VITE_AUTH0_DOMAIN || '',
};
