import { Alert } from 'react-bootstrap';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/carbon-credits/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <h2>Carbon Credits</h2>
      <Alert variant="info">Coming soon — carbon credit marketplace and tracking.</Alert>
    </>
  );
}
