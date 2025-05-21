import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api-client';
import { ElectricalDataUsagePoint } from "@shared";

export const useElectricalMeters = () => {

/* TODO: AUTH
const token = await getAuthToken(); // Retrieve the JWT from Auth0
apiClient<ElectricalDataSummary[]>('/v1/green-button/usage-summary', {
headers: { Authorization: `Bearer ${token}` },
});
*/

return useQuery({ queryKey: ['electricalMeters'], queryFn: () => apiClient<ElectricalDataUsagePoint[]>('/v1/green-button/usage-points') });
};
