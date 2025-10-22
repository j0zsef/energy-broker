import { createFileRoute, redirect } from '@tanstack/react-router';
import { EnergyProviderCallback } from '@energy-broker/components';

export const Route = createFileRoute('/connections/callback')({
  beforeLoad: ({ context }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({ to: '/' });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <EnergyProviderCallback />
  );
};
