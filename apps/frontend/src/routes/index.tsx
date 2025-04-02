import './index.scss';

import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: Index,
});

export function Index() {
  return (
    <>
      <h1>Energy Broker App</h1>
    </>
  );
}

export default Index;
