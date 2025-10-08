import { AddEnergySource } from '@energy-broker/components';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/sources/add')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <AddEnergySource />
  );
}
