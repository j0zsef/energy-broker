import { EnergyProviderCallback } from '@energy-broker/components';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/connections/callback')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <EnergyProviderCallback />
  );
};
