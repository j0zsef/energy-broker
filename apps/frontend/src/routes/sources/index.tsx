import './energy-sources.scss';
import { EnergySources } from '@energy-broker/components';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/sources/')({
  component: Index,
});

export function Index() {
  return (
    <div className="energy-sources">
      <EnergySources />
    </div>
  );
}
