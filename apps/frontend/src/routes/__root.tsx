import './root.scss';

import { Header, Navbar } from '@energy-broker/components';
import { Outlet, createRootRouteWithContext } from '@tanstack/react-router';
import { Container } from '@energy-broker/components';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterContext } from '../main';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { queryClient } from '@energy-broker/api-client';
import { useAuth0Context } from '../auth/auth0';

const RootComponent = () => {
  const { isAuthenticated, user, logout, login } = useAuth0Context();

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <div className="root">
          <Navbar />
          <Container border={true}>
            <Header
              isAuthenticated={isAuthenticated}
              user={user}
              onLogout={logout}
              onLogin={login}
            />
            <Outlet />
          </Container>
        </div>
        <TanStackRouterDevtools />
      </QueryClientProvider>
    </>
  );
};

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
  errorComponent: ({ error }) => (
    <div>
      Error:
      {error.message}
    </div>
  ),
});
