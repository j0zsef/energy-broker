import { ElectricalDataUsagePoint, EnergyUsageRequest } from '@energy-broker/shared';
import { apiClient } from '../../api-client';
import { useQuery } from '@tanstack/react-query';

export const useEnergyUsage = ({ connectionId, enabled = true, max, min }: EnergyUsageRequest & { enabled?: boolean }) => {
  const queryString = new URLSearchParams();
  if (min !== undefined) queryString.append('min', String(min));
  if (max !== undefined) queryString.append('max', String(max));
  const endpoint = `v1/connections/${connectionId}/usage${queryString.toString() ? `?${queryString}` : ''}`;

  return useQuery({
    enabled,
    queryFn: () => apiClient<ElectricalDataUsagePoint[]>(endpoint),
    queryKey: ['electricalMeters', connectionId, { max, min }],
  });
};
