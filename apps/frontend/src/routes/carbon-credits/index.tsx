import { CarbonCreditsPage, UnauthenticatedSpotlight } from '@energy-broker/components';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/carbon-credits/')({
  component: RouteComponent,
});

function RouteComponent() {
  const { auth } = Route.useRouteContext();

  if (!auth.isAuthenticated) {
    return (
      <UnauthenticatedSpotlight
        ctaText="Sign in to offset"
        description="Purchase verified carbon credits and track your offset history in one place."
        icon="🌿"
        iconVariant="carbon"
        onLogin={() => auth.login()}
        pills={[
          { label: 'Buy credits', variant: 'success' },
          { label: 'Track offsets', variant: 'info' },
          { label: 'Go net-zero', variant: 'warning' },
        ]}
        title="Offset your carbon footprint."
      />
    );
  }

  return <CarbonCreditsPage />;
}
