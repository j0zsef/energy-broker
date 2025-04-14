import './index.scss';

import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: Index,
});

export function Index() {
  return (
    <div className="index">
      <h1>Energy Broker App</h1>
    </div>
  );
}

export default Index;
