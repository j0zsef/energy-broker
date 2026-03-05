import { ElectricalDataSummary, EnergySummaryRequest } from '@energy-broker/shared';
import { apiClient } from '../../api-client';

export const fetchEnergySummary = ({ connectionId, max, meterId, min }: EnergySummaryRequest) => {
  const queryString = new URLSearchParams();
  if (min !== undefined) queryString.append('min', min);
  if (max !== undefined) queryString.append('max', max);

  const endpoint = `v1/connections/${connectionId}/summary/meters/${meterId}${queryString.toString() ? `?${queryString}` : ''}`;

  return apiClient<ElectricalDataSummary[]>(endpoint);
};
