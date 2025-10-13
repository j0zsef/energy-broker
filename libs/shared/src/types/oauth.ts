export interface AuthTokenRequest {
  code: string
  grant_type: string
  redirect_uri: string
  client_id: string
}

export interface AuthTokenResponse {
  access_token: string
  expires_in: number
  refresh_token: string
  resourceURI: string
  customerResourceURI: string
  authorizationURI: string
}
