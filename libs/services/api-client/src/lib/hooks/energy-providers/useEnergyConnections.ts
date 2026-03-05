import { EnergyProviderConnectionResponse } from '@energy-broker/shared';
import { apiClient } from '../../api-client';
import { useQuery } from '@tanstack/react-query';

export const useEnergyConnections = () => {
  const endpoint = `v1/energy-providers/connections`;

  return useQuery({
    queryKey: ['energyProvidersConnections'],
    queryFn: () => apiClient<EnergyProviderConnectionResponse[]>(endpoint),
  });
};
