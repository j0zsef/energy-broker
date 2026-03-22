import './root.scss';

import { Footer, Header, Navbar } from '@energy-broker/components';
import { Outlet, createRootRouteWithContext } from '@tanstack/react-router';
import { Offcanvas } from 'react-bootstrap';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterContext } from '../main';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { queryClient } from '@energy-broker/api-client';
import { useAuth0Context } from '../auth/auth0';
import { useState } from 'react';

const RootComponent = () => {
  const { isAuthenticated, login, logout, user } = useAuth0Context();
  const [showNav, setShowNav] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="root">
        {/* Desktop sidebar */}
        <aside className="root__sidebar d-none d-md-block">
          <Navbar />
        </aside>

        {/* Mobile offcanvas */}
        <Offcanvas onHide={() => setShowNav(false)} placement="start" show={showNav}>
          <Offcanvas.Header closeButton>
            <Offcanvas.Title>Energy Broker</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            <Navbar onNavigate={() => setShowNav(false)} />
          </Offcanvas.Body>
        </Offcanvas>

        {/* Main content */}
        <div className="root__main">
          <Header
            isAuthenticated={isAuthenticated}
            onLogin={login}
            onLogout={logout}
            onToggleNav={() => setShowNav(true)}
            user={user}
          />
          <main className="p-3 p-md-4">
            <Outlet />
          </main>
          <Footer />
        </div>
      </div>
      <TanStackRouterDevtools />
    </QueryClientProvider>
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
