import * as ReactDOM from 'react-dom/client';
import { Auth0ContextType, Auth0Wrapper, useAuth0Context } from './auth/auth0';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { StrictMode } from 'react';

import { routeTree } from './routeTree.gen';

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

  if (auth.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

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
