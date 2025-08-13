export interface OAuthProviderConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
  scopes: string[]
  authUrl: string
  tokenUrl: string
}

export interface OAuthProviderResponse {
  authUrl: string
  clientId: string
  redirectUri: string
}

export interface OAuthProviderRequest {
  provider: string
}
