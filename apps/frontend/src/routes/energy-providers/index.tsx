import { Alert } from 'react-bootstrap';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/energy-providers/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <h2>Energy Providers</h2>
      <Alert variant="info">Coming soon — browse and compare energy providers.</Alert>
    </>
  );
}
