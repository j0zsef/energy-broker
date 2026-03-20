import { apiClient, queryClient } from '../../api-client';
import { useMutation } from '@tanstack/react-query';

export const useDeleteConnection = () => {
  return useMutation({
    mutationFn: (connectionId: number) =>
      apiClient<{ success: boolean }>(`v1/connections/${connectionId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['energyProvidersConnections'] });
    },
  });
};
