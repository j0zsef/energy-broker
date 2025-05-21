import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api-client';
import { ElectricalDataSummary } from "@shared";

export const useElectricalSummary = () => {

  /* TODO: AUTH
  const token = await getAuthToken(); // Retrieve the JWT from Auth0
apiClient<ElectricalDataSummary[]>('/v1/green-button/usage-summary', {
  headers: { Authorization: `Bearer ${token}` },
});
   */
  return useQuery({ queryKey: ['electricalSummary'], queryFn: () => apiClient<ElectricalDataSummary[]>('/v1/green-button/usage-summary') });
};
