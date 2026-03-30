import { CarbonOrdersSummary } from '@energy-broker/shared';
import { apiClient } from '../../api-client';
import { useQuery } from '@tanstack/react-query';

export function useCarbonOrders() {
  return useQuery({
    queryFn: () => apiClient<CarbonOrdersSummary>('v1/carbon/orders'),
    queryKey: ['carbonOrders'],
  });
}
