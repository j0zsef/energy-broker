import { Button } from 'react-bootstrap';
import { EnergyOverview } from '@energy-broker/components';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: Index,
});

export function Index() {
  const { auth } = Route.useRouteContext();

  if (!auth.isAuthenticated) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center text-center py-5">
        <h1 className="fw-bold mb-3">Take Control of Your Energy</h1>
        <p className="text-muted mb-4" style={{ maxWidth: '32rem' }}>
          Connect your utility accounts, track consumption, and discover ways to save on your energy bills.
        </p>
        <Button onClick={() => auth.login()} size="lg" variant="primary">Get Started</Button>
      </div>
    );
  }

  return (
    <>
      <h2 className="mb-3">Energy Overview</h2>
      <EnergyOverview />
    </>
  );
}

export default Index;
