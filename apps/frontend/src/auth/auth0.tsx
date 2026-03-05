import { Auth0Provider, User, useAuth0 } from '@auth0/auth0-react';
import { createContext, useContext } from 'react';
import { ReactNode } from 'react';
import { authConfig } from '../config/auth-config';

export interface Auth0ContextType {
  isAuthenticated: boolean
  user: User | undefined
  login: () => void
  logout: () => void
  isLoading: boolean
}

const Auth0Context = createContext<Auth0ContextType | undefined>(undefined);

export function Auth0Wrapper({ children }: { children: ReactNode }) {
  return (
    <Auth0Provider
      domain={authConfig.auth0Domain}
      clientId={authConfig.auth0ClientId}
      authorizationParams={{
        audience: authConfig.auth0Audience,
        redirect_uri: window.location.origin,
        scope: 'openid profile email offline_access',
      }}
      useRefreshTokens={true}
      cacheLocation="memory"
    >
      <Auth0ContextProvider>{children}</Auth0ContextProvider>
    </Auth0Provider>
  );
}

function Auth0ContextProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, user, loginWithRedirect, logout, isLoading }
    = useAuth0<User>();

  const contextValue = {
    isAuthenticated,
    isLoading,
    login: loginWithRedirect,
    logout: () =>
      logout({ logoutParams: { returnTo: window.location.origin } }),
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
