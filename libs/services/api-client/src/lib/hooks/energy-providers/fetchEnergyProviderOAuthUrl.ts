import { apiClient } from '../../api-client';

export async function fetchEnergyProviderOAuthUrl(energyProviderId: number): Promise<string> {
  const data = await apiClient<{ url: string }>('v1/energy-providers/authorize', {
    body: JSON.stringify({ energyProviderId }),
    method: 'POST',
  });
  return data.url;
}
