import * as ReactDOM from 'react-dom/client';
import { Auth0ContextType, Auth0Wrapper, useAuth0Context } from './auth/auth0';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { StrictMode, useEffect } from 'react';
import { routeTree } from './routeTree.gen';
import { setAuthTokenGetter } from '@energy-broker/api-client';
import { useAuth0 } from '@auth0/auth0-react';

export type RouterContext = {
  auth: Auth0ContextType
};

// Create a new router instance
const router = createRouter({
  context: {
    auth: {
      isAuthenticated: false,
      isLoading: true,
      login: () => {},
      logout: () => {},
      user: undefined,
    },
  },
  routeTree,
});

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

function App() {
  const auth = useAuth0Context();
  const { getAccessTokenSilently } = useAuth0();

  if (auth.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  useEffect(() => {
    setAuthTokenGetter(() => getAccessTokenSilently());
  }, [getAccessTokenSilently]);

  return <RouterProvider router={router} context={{ auth }} />;
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

root.render(
  <StrictMode>
    <Auth0Wrapper>
      <App />
    </Auth0Wrapper>
  </StrictMode>,
);
