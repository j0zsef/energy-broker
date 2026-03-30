import { createFileRoute, redirect } from '@tanstack/react-router';
import { OffsetCarbon } from '@energy-broker/components';

export const Route = createFileRoute('/carbon-credits/offset')({
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
  return <OffsetCarbon />;
}
