import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api-client';
import {ElectricalDataSummary, EnergySummaryRequest} from "@energy-broker/shared";

export const useEnergySummary = ({connectionId, max, meterId, min}: EnergySummaryRequest) => {

  /* TODO: AUTH
  const token = await getAuthToken(); // Retrieve the JWT from Auth0
apiClient<ElectricalDataSummary[]>('/v1/green-button/usage-summary', {
  headers: { Authorization: `Bearer ${token}` },
});
   */

  const queryString = new URLSearchParams();
  if (min !== undefined) queryString.append('min', String(min));
  if (max !== undefined) queryString.append('max', String(max));
  queryString.append('meterId', String(meterId));

  const endpoint = `v1/connections/${connectionId}/summary/meters/:meterId${queryString.toString() ? `?${queryString}` : ''}`;

  return useQuery({
    queryKey: ['electricalSummary', { max, meterId, min }],
    queryFn: () => apiClient<ElectricalDataSummary[]>(endpoint),
  });
};
