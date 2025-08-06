import { useMutation } from '@tanstack/react-query';
import { OAuthProviderResponse, OAuthProviderRequest } from '@shared';
import { apiClient } from '../../api-client';

export function useOAuthProvider() {
  return useMutation<OAuthProviderResponse, Error, OAuthProviderRequest>({
    mutationFn: ({ provider }) =>
      apiClient<OAuthProviderResponse>(`v1/oauth/${provider}`, {
        method: 'POST',
      }),
  });
}
