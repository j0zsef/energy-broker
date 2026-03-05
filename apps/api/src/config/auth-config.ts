export const authConfig = {
  auth0Audience: process.env.AUTH0_AUDIENCE || process.env.VITE_AUTH0_AUDIENCE || '',
  auth0Domain: process.env.AUTH0_DOMAIN || process.env.VITE_AUTH0_DOMAIN || '',
};
