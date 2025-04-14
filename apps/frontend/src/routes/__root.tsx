import { Outlet, createRootRoute } from '@tanstack/react-router';
import { Container } from 'react-bootstrap';
import { Header, Navbar } from '@energy-broker/components';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

import './root.scss';

export const Route = createRootRoute({
  component: () => (
    <>
      <div className="root">
        <Navbar />
        <Container className="d-flex flex-column">
          <Header />
          <Outlet />
        </Container>
      </div>
      <TanStackRouterDevtools />
    </>
  ),
});
