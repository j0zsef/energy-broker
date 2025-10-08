import { EnergySources } from '@energy-broker/components';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/sources/')({
  component: Index,
});

export function Index() {
  return (
    <EnergySources />
  );
}
