import { EnergyProvidersResponse } from '@energy-broker/shared';
import { apiClient } from '../../api-client';
import { useQuery } from '@tanstack/react-query';

export function useEnergyProviders() {
  return useQuery({
    queryFn: () => apiClient<EnergyProvidersResponse>('v1/energy-providers'),
    queryKey: ['energyProviders'],
  });
}
