import { QueryCache, QueryClient } from '@tanstack/react-query';
import { apiConfig } from '../config/api-config';

const baseUrl = apiConfig.apiBaseUrl;

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

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
    throw new ApiError(`API error: ${response.statusText}`, response.status);
  }

  return response.json();
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (error instanceof ApiError && error.status === 401) return false;
        return failureCount < 3;
      },
    },
  },
  queryCache: new QueryCache({
    onError: (error) => {
      if (error instanceof ApiError && error.status === 401) {
        window.location.href = '/';
      }
    },
  }),
});
