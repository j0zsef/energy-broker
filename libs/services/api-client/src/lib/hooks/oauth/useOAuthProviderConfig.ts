import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api-client';
import { OAuthProviderConfig } from '@shared';

export function useOAuthProviderConfig(oAuthProviderConfigId: number) {
  return useQuery({
    queryKey: ['oauthProviderConfig', oAuthProviderConfigId],
    queryFn: () => apiClient<OAuthProviderConfig>(`api/oauth/config/${oAuthProviderConfigId}`),
    enabled: !!oAuthProviderConfigId,
  });
}
