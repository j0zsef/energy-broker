import { Outlet, createRootRoute } from '@tanstack/react-router';
import { Container } from 'react-bootstrap';
import { Navbar } from '@energy-broker/components';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

export const Route = createRootRoute({
  component: () => (
    <>
      <div className="d-flex">
        <Navbar />
        <Container>

          <Outlet />

        </Container>
      </div>
      <TanStackRouterDevtools />
    </>
  ),
});
