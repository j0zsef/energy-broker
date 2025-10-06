import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api-client';
import { EnergyProvidersResponse } from '@shared';

export function useEnergyProviders() {
  return useQuery({
    queryKey: ['energyProviders'],
    queryFn: () => apiClient<EnergyProvidersResponse>('v1/energy-providers'),
  });
}
