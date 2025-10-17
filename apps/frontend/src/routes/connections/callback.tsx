import { createFileRoute, useRouteContext } from '@tanstack/react-router';
import { EnergyProviderCallback } from '@energy-broker/components';

export const Route = createFileRoute('/connections/callback')({
  component: RouteComponent,
});

function RouteComponent() {
  const { auth } = useRouteContext({ from: '/connections/callback' });

  if (!auth?.user?.sub) {
    return <div>Loading...</div>; // or redirect to login
  }

  return (
    <EnergyProviderCallback userId={auth.user.sub} />
  );
};
