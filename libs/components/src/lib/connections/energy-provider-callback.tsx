import { useEffect, useRef } from 'react';
import { Spinner } from '../shared/spinner';
import { useAuthStore } from '@stores';
import { useNavigate } from '@tanstack/react-router';

import { useProcessEnergyConnection } from '@energy-broker/api-client';

export type EnergyProviderCallbackProps = {
  userId: string
};

export const EnergyProviderCallback = ({ userId }: EnergyProviderCallbackProps) => {
  const navigate = useNavigate();
  const hasProcessed = useRef(false);
  const params = new URLSearchParams(window.location.search);

  const code = params.get('code');
  const oauthError = params.get('error');
  const errorDescription = params.get('error_description');

  // TODO: toast notification for errors & retry
  if (oauthError) {
    return (
      <div>
        OAuth Error:
        {' '}
        {oauthError}
        <br />
        {errorDescription && `Description: ${decodeURIComponent(errorDescription)}`}
      </div>
    );
  }

  const tokenUrl = useAuthStore.getState().authTokenUrl;
  const redirectUri = window.location.href;
  const { processConnection, isLoading, error } = useProcessEnergyConnection(tokenUrl || '');

  useEffect(() => {
    if (hasProcessed.current || !code) return;

    const clientId = useAuthStore.getState().clientId;
    const providerId = useAuthStore.getState().providerId;

    if (tokenUrl && clientId && providerId) {
      hasProcessed.current = true;

      processConnection(code, clientId, providerId, redirectUri, userId)
        .then(() => {
          useAuthStore.setState({
            authTokenUrl: undefined,
            clientId: undefined,
            providerId: undefined,
          });
          navigate({ to: '/connections' });
        },
        )
        .catch(console.error);
    }
    else {
      console.error('Missing auth configuration');
      navigate({ to: '/connections' });
    }
  }, [code, tokenUrl, userId]);

  if (isLoading) {
    return <Spinner />;
  }

  // TODO: toast notification for errors & retry
  if (error) {
    console.error('Auth failed:', error);
    return (
      <div>
        Error:
        {error.message}
      </div>
    );
  }

  return null;
};
