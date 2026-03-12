import { ReactNode, createContext, useCallback, useContext, useEffect, useState } from 'react';
import { apiClient } from '@energy-broker/api-client';

interface AuthUser {
  email?: string
  name?: string
  picture?: string
  sub: string
}

export interface Auth0ContextType {
  isAuthenticated: boolean
  isLoading: boolean
  login: () => void
  logout: () => void
  user: AuthUser | undefined
}

const Auth0Context = createContext<Auth0ContextType | undefined>(undefined);

export function Auth0Wrapper({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | undefined>(undefined);

  useEffect(() => {
    apiClient<{ email?: string, name?: string, picture?: string, userId: string }>('v1/auth/me')
      .then((data) => {
        setUser({
          email: data.email,
          name: data.name,
          picture: data.picture,
          sub: data.userId,
        });
      })
      .catch(() => {
        setUser(undefined);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const login = useCallback(() => {
    apiClient<{ url: string }>('v1/auth/login')
      .then((data) => {
        window.location.href = data.url;
      })
      .catch((error) => {
        console.error('Login failed:', error);
      });
  }, []);

  const logout = useCallback(() => {
    apiClient<{ url: string }>('v1/auth/logout', { method: 'POST' })
      .then((data) => {
        window.location.href = data.url;
      })
      .catch((error) => {
        console.error('Logout failed:', error);
      });
  }, []);

  const contextValue: Auth0ContextType = {
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    user,
  };

  return (
    <Auth0Context.Provider value={contextValue}>
      {children}
    </Auth0Context.Provider>
  );
}

export function useAuth0Context() {
  const context = useContext(Auth0Context);
  if (context === undefined) {
    throw new Error('useAuth0Context must be used within Auth0Wrapper');
  }
  return context;
}
