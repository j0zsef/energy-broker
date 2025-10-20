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
  return <div>Hello account summary</div>;
}
