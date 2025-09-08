export interface OAuthProviderConfig {
  authUrl: string
  clientId: string
  providerName: string
  redirectUri: string
  scopes: string
  tokenUrl: string
}

export interface OAuthProviderResponse {
  authUrl: string
  clientId: string
  tokenUrl: string
  redirectUri: string
}

export interface OAuthProviderRequest {
  provider: string
}
