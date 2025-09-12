import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// TODO: we can keep the store for now but might not need with the new schema

type AuthState = {
  clearAuth: () => void
  provider: string | null
  resourceUri: string | null
  setAuthToken: (token: string) => void
  setAuthTokenUrl: (url: string) => void
  setProvider: (provider: string) => void
  setResourceUri: (uri: string) => void
  token: string | null
  tokenUrl: string | null
};

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      clearAuth: () => set({ resourceUri: null, token: null, tokenUrl: null }),
      provider: null,
      resourceUri: null,
      setAuthToken: token => set({ token }),
      setAuthTokenUrl: tokenUrl => set({ tokenUrl }),
      setProvider: (provider: string) => set({ provider }),
      setResourceUri: resourceUri => set({ resourceUri }),
      token: null,
      tokenUrl: null,
    }),
    {
      name: 'auth-storage',
    },
  ),
);
