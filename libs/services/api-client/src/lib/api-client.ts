import { QueryClient } from '@tanstack/react-query';
import { nodeConfig } from '@shared';

const baseUrl = `http://${nodeConfig.host}:${nodeConfig.port}`;

export const apiClient = async <T>(endpoint: string, options?: RequestInit): Promise<T> => {
  const response = await fetch(`${baseUrl}`, {
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
