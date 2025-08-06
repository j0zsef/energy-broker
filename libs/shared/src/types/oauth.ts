export interface OAuthProviderConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
  scopes: string[]
  authUrl: string
  tokenUrl: string
}

export interface OAuthProviderResponse {
  redirectUri: string
}

export interface OAuthProviderRequest {
  provider: string
}
