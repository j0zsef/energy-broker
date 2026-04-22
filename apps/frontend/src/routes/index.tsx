import { EnergyOverview, UnauthenticatedSpotlight } from '@energy-broker/components';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: Index,
});

export function Index() {
  const { auth } = Route.useRouteContext();

  if (!auth.isAuthenticated) {
    return (
      <UnauthenticatedSpotlight
        ctaText="Sign in to get started"
        description="Sign in to see a summary of all your energy data in one place."
        icon="⚡"
        iconVariant="energy"
        onLogin={() => auth.login()}
        pills={[
          { label: 'Usage trends', variant: 'warning' },
          { label: 'Connections', variant: 'primary' },
          { label: 'Carbon offset', variant: 'success' },
        ]}
        title="Your energy, at a glance."
      />
    );
  }

  return <EnergyOverview />;
}

export default Index;
