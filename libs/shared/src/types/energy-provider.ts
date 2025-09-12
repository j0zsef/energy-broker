export interface EnergyProvider {
  fullName: string
  id: number
  name: string
  oAuthProviderConfigId: number
  type: 'electrical' | 'gas' | 'water'
}

export interface EnergyProviderLocation {
  energyProviderId: number
  zip: string
}

export interface EnergyProviderAuth {
  authToken: string
  energyProviderId: number
  expiresAt: Date
  refreshToken: string
  resourceUri: string
  userId: number
}

export interface EnergyProvidersResponseItem extends EnergyProvider {
  zips: string[]
}

export type EnergyProvidersResponse = EnergyProvidersResponseItem[];
