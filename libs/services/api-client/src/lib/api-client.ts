import { QueryClient } from '@tanstack/react-query';
import { viteEnvVars } from '@energy-broker/shared';

const baseUrl = `http://${viteEnvVars.apiHost}:${viteEnvVars.apiPort}`;

let getAccessToken: (() => Promise<string>) | null = null;

export const setAuthTokenGetter = (getter: () => Promise<string>) => {
  getAccessToken = getter;
};

export const apiClient = async <T>(endpoint: string, options?: RequestInit): Promise<T> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };

  if (getAccessToken) {
    try {
      const token = await getAccessToken();
      headers['Authorization'] = `Bearer ${token}`;
    } catch (error) {
      console.error('Failed to get access token:', error);
      throw error;
    }
  }

  const response = await fetch(`${baseUrl}/${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  return response.json();
};

export const queryClient = new QueryClient();
