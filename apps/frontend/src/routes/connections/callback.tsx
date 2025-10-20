import { createFileRoute, redirect, useRouteContext } from '@tanstack/react-router';
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
  const { auth } = useRouteContext({ from: '/connections/callback' });

  if (!auth?.user?.sub) {
    return <div>Loading...</div>;
  }

  return (
    <EnergyProviderCallback userId={auth.user.sub} />
  );
};
