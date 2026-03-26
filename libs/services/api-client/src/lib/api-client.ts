import { QueryClient } from '@tanstack/react-query';
import { apiConfig } from '../config/api-config';

const baseUrl = apiConfig.apiBaseUrl;

export const apiClient = async <T>(endpoint: string, options?: RequestInit): Promise<T> => {
  const headers: Record<string, string> = {
    ...(options?.body ? { 'Content-Type': 'application/json' } : {}),
    ...(options?.headers as Record<string, string>),
  };

  const response = await fetch(`${baseUrl}/${endpoint}`, {
    ...options,
    credentials: 'include',
    headers,
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  return response.json();
};

export const queryClient = new QueryClient();
