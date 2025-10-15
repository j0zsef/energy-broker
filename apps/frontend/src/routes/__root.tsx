import './root.scss';

import { Header, Navbar } from '@energy-broker/components';
import { Outlet, createRootRoute } from '@tanstack/react-router';
import { Container } from '@energy-broker/components';
import { QueryClientProvider } from '@tanstack/react-query';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { queryClient } from '@energy-broker/api-client';

export const Route = createRootRoute({
  component: () => (
    <>
      <QueryClientProvider client={queryClient}>
        <div className="root">
          <Navbar />
          <Container border={true}>
            <Header />
            <Outlet />
          </Container>
        </div>
        <TanStackRouterDevtools />
      </QueryClientProvider>
    </>
  ),
  errorComponent: ({ error }) => (
    <div>
      Error:
      {error.message}
    </div>
  ),
});
