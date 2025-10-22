

import { useMutation } from '@tanstack/react-query';
import { EnergyProviderConnection } from '@energy-broker/shared';
import { apiClient } from '../../api-client';
import { useExchangeAuthCode } from '../oauth/useAuthCodeExchange';
import {useAuth0} from "@auth0/auth0-react";

export const useSaveEnergyConnection = () => {
  return useMutation({
    mutationFn: (energyProviderAuth: EnergyProviderConnection) =>
      apiClient(`v1/energy-providers/connection`, {
        body: JSON.stringify(energyProviderAuth),
        method: 'POST',
      }),
  });
}

export const useProcessEnergyConnection = (tokenUrl: string) => {
  const exchangeCode = useExchangeAuthCode(tokenUrl);
  const saveConnection = useSaveEnergyConnection();
  const { user } = useAuth0();

  const processConnection = async (code: string,
                                   clientId: string,
                                   energyProviderId: number,
                                   redirectUri: string) => {
    const tokenResponse = await exchangeCode.mutateAsync({
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
      client_id: clientId,
    });

    await saveConnection.mutateAsync({
      authToken: tokenResponse.access_token,
      energyProviderId,
      expiresAt: new Date(tokenResponse.expires_in),
      refreshToken: tokenResponse.refresh_token,
      resourceUri: tokenResponse.resourceURI,
      userId: user?.sub || 'unknown',
    });
  };

  return {
    processConnection,
    isLoading: exchangeCode.isPending || saveConnection.isPending,
    error: exchangeCode.error || saveConnection.error,
  };
};
