import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// TODO: need to clean this up

type AuthState = {
  authTokenUrl: string | undefined
  providerId: number | undefined
  setAuthTokenUrl: (url: string) => void
  setProviderId: (provider: number) => void
};

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      authTokenUrl: undefined,
      providerId: undefined,
      setAuthTokenUrl: authTokenUrl => set({ authTokenUrl }),
      setProviderId: (providerId: number) => set({ providerId }),
    }),
    {
      name: 'auth-storage',
    },
  ),
);
