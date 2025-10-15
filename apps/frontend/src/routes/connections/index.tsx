import { EnergyConnections } from '@energy-broker/components';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/connections/')({
  component: Index,
});

export function Index() {
  return <EnergyConnections />;
}
