import { CarbonProject } from '@energy-broker/shared';
import { apiClient } from '../../api-client';
import { useQuery } from '@tanstack/react-query';

export interface CarbonProjectFilters {
  country?: string
  type?: string
}

export function useCarbonProjects(filters?: CarbonProjectFilters) {
  const params = new URLSearchParams();
  if (filters?.country) params.append('country', filters.country);
  if (filters?.type) params.append('type', filters.type);
  const qs = params.toString();
  const endpoint = `v1/carbon/projects${qs ? `?${qs}` : ''}`;

  return useQuery({
    queryFn: () => apiClient<CarbonProject[]>(endpoint),
    queryKey: ['carbonProjects', filters],
  });
}
