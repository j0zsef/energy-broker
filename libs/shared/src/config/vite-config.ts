/// <reference types="vite/client" />

export const viteConfig = {
  apiHost: import.meta.env.VITE_API_HOST || 'localhost',
  apiPort: import.meta.env.VITE_API_PORT ? Number(import.meta.env.VITE_API_PORT) : 3000,
};
