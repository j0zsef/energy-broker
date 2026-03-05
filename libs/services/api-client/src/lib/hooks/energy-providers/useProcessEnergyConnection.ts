import { EnergyProviderConnection } from '@energy-broker/shared';
import { apiClient } from '../../api-client';
import { useAuth0 } from '@auth0/auth0-react';
import { useExchangeAuthCode } from '../oauth/useAuthCodeExchange';
import { useMutation } from '@tanstack/react-query';

export const useSaveEnergyConnection = () => {
  return useMutation({
    mutationFn: (energyProviderAuth: EnergyProviderConnection) =>
      apiClient(`v1/energy-providers/connection`, {
        body: JSON.stringify(energyProviderAuth),
        method: 'POST',
      }),
  });
};

export const useProcessEnergyConnection = (tokenUrl: string) => {
  const exchangeCode = useExchangeAuthCode(tokenUrl);
  const saveConnection = useSaveEnergyConnection();
  const { user } = useAuth0();

  const processConnection = async (code: string,
                                   clientId: string,
                                   energyProviderId: number,
                                   redirectUri: string) => {
    if (!user?.sub) {
      throw new Error('User is not authenticated');
    }

    const tokenResponse = await exchangeCode.mutateAsync({
      client_id: clientId,
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
    });

    await saveConnection.mutateAsync({
      authToken: tokenResponse.access_token,
      energyProviderId,
      expiresAt: new Date(Date.now() + tokenResponse.expires_in * 1000),
      refreshToken: tokenResponse.refresh_token,
      resourceUri: tokenResponse.resourceURI,
      userId: user.sub,
    });
  };

  return {
    processConnection,
    isLoading: exchangeCode.isPending || saveConnection.isPending,
    error: exchangeCode.error || saveConnection.error,
  };
};
