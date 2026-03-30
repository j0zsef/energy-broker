import { apiClient, queryClient } from '../../api-client';
import { CarbonOrderResponse } from '@energy-broker/shared';
import { useMutation } from '@tanstack/react-query';

export function usePlaceCarbonOrder() {
  return useMutation({
    mutationFn: (orderId: number) =>
      apiClient<CarbonOrderResponse>(`v1/carbon/orders/${orderId}/place`, {
        method: 'PATCH',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carbonOrders'] });
    },
  });
}
