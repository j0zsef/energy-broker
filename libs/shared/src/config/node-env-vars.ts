export const nodeEnvVars = {
  apiHost: process.env.VITE_API_HOST || 'localhost',
  apiPort: process.env.VITE_API_PORT ? Number(process.env.VITE_API_PORT) : 3000,
};
