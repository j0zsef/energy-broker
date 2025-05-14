import 'vite/client';

export const nodeConfig = {
  host: import.meta.env.VITE_HOST || 'localhost',
  port: import.meta.env.VITE_PORT ? Number(import.meta.env.VITE_PORT) : 3000,
};
