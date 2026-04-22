import { createFileRoute, redirect } from '@tanstack/react-router';
import { AddEnergyProvider } from '@energy-broker/components';

export const Route = createFileRoute('/connections/add')({
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
  return <AddEnergyProvider />;
}
