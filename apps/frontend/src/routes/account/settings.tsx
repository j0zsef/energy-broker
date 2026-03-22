import { Card, Form } from 'react-bootstrap';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { useTheme } from '../../theme/theme-context';

export const Route = createFileRoute('/account/settings')({
  beforeLoad: ({ context, location }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({
        search: { redirect: location.href },
        to: '/',
      });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { auth } = Route.useRouteContext();
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      <h2>Settings</h2>

      <Card className="mb-3">
        <Card.Header>Appearance</Card.Header>
        <Card.Body>
          <Form.Check
            checked={theme === 'dark'}
            id="dark-mode-toggle"
            label="Dark mode"
            onChange={toggleTheme}
            type="switch"
          />
        </Card.Body>
      </Card>

      <Card>
        <Card.Header>Profile</Card.Header>
        <Card.Body className="d-flex align-items-center gap-3">
          {auth.user?.picture && (
            <img
              alt="Avatar"
              className="rounded-circle"
              height={48}
              src={auth.user.picture}
              width={48}
            />
          )}
          <div>
            <div className="fw-semibold">{auth.user?.name ?? 'Unknown'}</div>
            <div className="text-body-secondary">{auth.user?.email ?? ''}</div>
          </div>
        </Card.Body>
      </Card>
    </>
  );
}
