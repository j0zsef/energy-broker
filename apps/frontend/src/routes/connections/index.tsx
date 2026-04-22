import { EnergyConnections, UnauthenticatedSpotlight } from '@energy-broker/components';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/connections/')({
  component: Index,
});

export function Index() {
  const { auth } = Route.useRouteContext();

  if (!auth.isAuthenticated) {
    return (
      <UnauthenticatedSpotlight
        ctaText="Sign in to connect"
        description="Link your providers to start tracking consumption and costs across all accounts."
        icon="🔌"
        iconVariant="connections"
        onLogin={() => auth.login()}
        pills={[
          { label: 'Monitor usage', variant: 'primary' },
          { label: 'Track costs', variant: 'info' },
          { label: 'Manage access', variant: 'secondary' },
        ]}
        title="Connect your energy providers."
      />
    );
  }

  return <EnergyConnections />;
}
