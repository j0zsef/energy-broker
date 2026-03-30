import { CheckoutResponse, CreateOrderRequest } from '@energy-broker/shared';
import { apiClient } from '../../api-client';
import { useMutation } from '@tanstack/react-query';

export function useCreateCarbonOrder() {
  return useMutation({
    mutationFn: (request: CreateOrderRequest) =>
      apiClient<CheckoutResponse>('v1/carbon/orders/create', {
        body: JSON.stringify(request),
        method: 'POST',
      }),
  });
}
