import { ElectricalDataUsagePoint, EnergyUsageRequest } from '@energy-broker/shared';
import { apiClient } from '../../api-client';
import { useQuery } from '@tanstack/react-query';

export const fetchEnergyUsage = ({ connectionId, max, min }: EnergyUsageRequest) => {
  const queryString = new URLSearchParams();
  if (min !== undefined) queryString.append('min', String(min));
  if (max !== undefined) queryString.append('max', String(max));
  const endpoint = `v1/connections/${connectionId}/usage${queryString.toString() ? `?${queryString}` : ''}`;

  return apiClient<ElectricalDataUsagePoint[]>(endpoint);
};

export const useEnergyUsage = ({ connectionId, enabled = true, max, min }: EnergyUsageRequest & { enabled?: boolean }) => {
  return useQuery({
    enabled,
    queryFn: () => fetchEnergyUsage({ connectionId, max, min }),
    queryKey: ['electricalMeters', connectionId, { max, min }],
  });
};
