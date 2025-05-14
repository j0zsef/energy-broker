import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api-client';

export const useExampleData = () => {
  return useQuery({ queryKey: ['exampleData'], queryFn: () => apiClient('/example-data')});
};
