import { EnergyProviderConnectionResponse } from "@energy-broker/shared";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../api-client";

export const useEnergyConnections = () => {
  const endpoint = `v1/energy-providers/connections`;

  return useQuery({
    queryKey: ['energyProvidersConnections'],
    queryFn: () => apiClient<EnergyProviderConnectionResponse[]>(endpoint),
  });
};
