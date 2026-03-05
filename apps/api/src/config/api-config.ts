export const apiConfig = {
  apiHost: process.env.API_HOST || process.env.VITE_API_HOST || 'localhost',
  apiPort: Number(process.env.API_PORT || process.env.VITE_API_PORT) || 9400,
};
