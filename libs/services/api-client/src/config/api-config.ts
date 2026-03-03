/// <reference types="vite/client" />

export const apiConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:9400',
  auth0Audience: import.meta.env.VITE_AUTH0_AUDIENCE || '',
  auth0ClientId: import.meta.env.VITE_AUTH0_CLIENT_ID || '',
  auth0Domain: import.meta.env.VITE_AUTH0_DOMAIN || '',
};
