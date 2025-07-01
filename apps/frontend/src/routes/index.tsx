import './index.scss';
import { Overview } from '@energy-broker/components';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: Index,
});

export function Index() {
  return (
    <div className="index">
      <h1>Energy Broker App</h1>
      <Overview />
    </div>
  );
}

export default Index;
