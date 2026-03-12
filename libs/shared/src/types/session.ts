export interface SessionData {
  accessToken?: string
  codeVerifier?: string
  email?: string
  expiresAt?: number
  name?: string
  oauthEnergyProviderId?: number
  oauthState?: string
  picture?: string
  refreshToken?: string
  userId?: string
}

export interface SessionUser {
  email?: string
  name?: string
  picture?: string
  userId: string
}
