import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api-client';
import { ElectricalDataUsagePoint, EnergyUsageRequest } from "@energy-broker/shared";

export const useEnergyUsage = ({ connectionId, max, min }: EnergyUsageRequest) => {

/* TODO: AUTH
const token = await getAuthToken(); // Retrieve the JWT from Auth0
apiClient<ElectricalDataSummary[]>('/v1/green-button/usage-summary', {
headers: { Authorization: `Bearer ${token}` },
});
*/

  const queryString = new URLSearchParams();
  if (min !== undefined) queryString.append('min', String(min));
  if (max !== undefined) queryString.append('max', String(max));
  const endpoint = `v1/connections/${connectionId}/usage${queryString.toString() ? `?${queryString}` : ''}`;

  return useQuery({
    queryKey: ['electricalMeters', { min, max }],
    queryFn: () => apiClient<ElectricalDataUsagePoint[]>(endpoint),
  });
};
