import { QueryClient } from '@tanstack/react-query';
import { viteConfig } from '@shared/vite-config';

const baseUrl = `http://${viteConfig.apiHost}:${viteConfig.apiPort}`;

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
