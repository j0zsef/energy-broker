/// <reference types="vite/client" />

export const authConfig = {
  auth0Audience: import.meta.env.VITE_AUTH0_AUDIENCE || '',
  auth0ClientId: import.meta.env.VITE_AUTH0_CLIENT_ID || '',
  auth0Domain: import.meta.env.VITE_AUTH0_DOMAIN || '',
};
