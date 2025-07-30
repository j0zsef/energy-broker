import './index.scss';
import { Overview } from '@energy-broker/components';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: Index,
});

export function Index() {
  return (
    <div className="index">
      <Overview />
    </div>
  );
}

export default Index;
