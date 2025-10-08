import { EnergySourceCallback } from '@energy-broker/components';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/sources/callback')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <EnergySourceCallback />
  );
};
