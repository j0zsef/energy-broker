/// <reference types="vite/client" />

export const apiConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:9400',
};
