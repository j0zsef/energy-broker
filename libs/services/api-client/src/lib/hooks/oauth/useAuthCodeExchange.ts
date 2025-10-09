import { useMutation } from '@tanstack/react-query';
import { AuthTokenRequest, AuthTokenResponse } from '@shared';

export const useExchangeAuthCode = (tokenUrl: string) => {
  return useMutation({
    mutationFn: async (request: AuthTokenRequest): Promise<AuthTokenResponse> => {
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error('Token exchange failed');
      }

      return response.json();
    },
  });
};
