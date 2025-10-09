

import { useMutation } from '@tanstack/react-query';
import { EnergyProviderAuth } from '@shared';
import { apiClient } from '../../api-client';
import { useExchangeAuthCode } from '../oauth/useAuthCodeExchange';

export const useSaveEnergyAuth = () => {
  return useMutation({
    mutationFn: (energyProviderAuth: EnergyProviderAuth) =>
      apiClient(`v1/energy-providers/auth`, {
        body: JSON.stringify(energyProviderAuth),
        method: 'POST',
      }),
  });
}

export const useEnergyAuth = (tokenUrl: string) => {
  const exchangeCode = useExchangeAuthCode(tokenUrl);
  const saveAuth = useSaveEnergyAuth();

  const processAuth = async (code: string, clientId: string, energyProviderId: number, redirectUri: string) => {
    const tokenResponse = await exchangeCode.mutateAsync({
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
      client_id: clientId,
    });

    await saveAuth.mutateAsync({
      authToken: tokenResponse.access_token,
      energyProviderId,
      expiresAt: new Date(tokenResponse.expires_in),
      refreshToken: tokenResponse.refresh_token,
      resourceUri: tokenResponse.resourceURI,
      userId: 1, // TODO: replace with actual user ID
    });
  };

  return {
    processAuth,
    isLoading: exchangeCode.isPending || saveAuth.isPending,
    error: exchangeCode.error || saveAuth.error,
  };
};
