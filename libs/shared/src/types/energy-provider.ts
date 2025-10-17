// TODO: need to make a entity for EnergyType
export interface EnergyProvider {
  fullName: string
  id: number
  name: string
  oAuthProviderConfigId: number
  type: 'electrical' | 'gas' | 'solar' | 'water'
}

export interface EnergyProviderLocation {
  energyProviderId: number
  zip: string
}

export interface EnergyProviderConnection {
  authToken: string
  energyProviderId: number
  expiresAt: Date
  refreshToken: string
  resourceUri: string
  userId: string
}

export interface OAuthProviderConfig {
  authUrl: string
  clientId: string
  id: number
  redirectUri: string
  scopes: string
  tokenUrl: string
}

export interface EnergyProvidersResponseItem extends EnergyProvider {
  oAuthProviderConfig: OAuthProviderConfig
  zips: string[]
}

export type EnergyProvidersResponse = EnergyProvidersResponseItem[];
