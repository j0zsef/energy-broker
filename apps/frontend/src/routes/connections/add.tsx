import { AddEnergyProvider } from '@energy-broker/components';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/connections/add')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <AddEnergyProvider />
  );
}
