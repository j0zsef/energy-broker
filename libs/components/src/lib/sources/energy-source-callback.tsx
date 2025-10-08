import { useEffect, useState } from 'react';
import { Spinner } from '../shared/spinner';
import { useAuthStore } from '@stores';
import { useNavigate } from '@tanstack/react-router';

export const EnergySourceCallback = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Handle OAuth redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const tokenUrl = useAuthStore.getState().authTokenUrl;
    const clientId = useAuthStore.getState().clientId;

    if (code && tokenUrl && clientId) {
      // Exchange code for access token
      fetch(tokenUrl, {
        body: JSON.stringify({ code }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      })
        .then(res => res.json())
        .then(async ({ access_token }) => {
          // TODO: save in EnergyProviderAuth table

          setLoading(false);
          console.log(access_token);

          // Redirect to energy sources list
          await navigate({ to: '/sources' });
        })
        .catch(() => {
          setLoading(false);
        });
    }
    else {
      setLoading(false);
      console.error('Unable to load energy source callback');
    }
  }, [navigate]);

  if (loading) {
    return <Spinner />; // Replace with a spinner if desired
  }

  return null;
};
