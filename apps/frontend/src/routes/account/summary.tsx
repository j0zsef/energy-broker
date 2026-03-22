import { createFileRoute, redirect } from '@tanstack/react-router';
import { Card } from 'react-bootstrap';

export const Route = createFileRoute('/account/summary')({
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

  const user = auth.user;

  if (!user) {
    return <div>Loading user information...</div>;
  }

  return (
    <Card className="mx-auto" style={{ maxWidth: '24rem' }}>
      <Card.Body className="text-center py-4">
        <img
          alt={user.name}
          className="rounded-circle mb-3"
          height={80}
          src={user.picture}
          width={80}
        />
        <h4 className="mb-1">{user.name}</h4>
        <p className="text-muted mb-0">{user.email}</p>
      </Card.Body>
    </Card>
  );
}
