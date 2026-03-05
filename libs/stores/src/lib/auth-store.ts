import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type AuthState = {
  authTokenUrl: string | undefined
  clientId: string | undefined
  oauthState: string | undefined
  providerId: number | undefined
  setAuthTokenUrl: (url: string) => void
  setClientId: (clientId: string) => void
  setOAuthState: (state: string) => void
  setProviderId: (provider: number) => void
};

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      authTokenUrl: undefined,
      clientId: undefined,
      oauthState: undefined,
      providerId: undefined,
      setAuthTokenUrl: authTokenUrl => set({ authTokenUrl }),
      setClientId: (clientId: string) => set({ clientId }),
      setOAuthState: (oauthState: string) => set({ oauthState }),
      setProviderId: (providerId: number) => set({ providerId }),
    }),
    {
      name: 'auth-storage',
    },
  ),
);
