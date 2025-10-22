import { createFileRoute, redirect } from '@tanstack/react-router';

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

  return (
    user
      ? (
          <div>
            <img src={user.picture} alt={user.name} />
            <h2>{user.name}</h2>
            <p>{user.email}</p>
          </div>
        )
      : (
          <div>Loading user information...</div>
        )
  );
}
