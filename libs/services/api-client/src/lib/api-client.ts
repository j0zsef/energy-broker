import { QueryClient } from '@tanstack/react-query';
import { viteEnvVars } from '@shared/vite-env-vars';

const baseUrl = `http://${viteEnvVars.apiHost}:${viteEnvVars.apiPort}`;

export const apiClient = async <T>(endpoint: string, options?: RequestInit): Promise<T> => {
  const response = await fetch(`${baseUrl}/${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  return response.json();
};

export const queryClient = new QueryClient();
