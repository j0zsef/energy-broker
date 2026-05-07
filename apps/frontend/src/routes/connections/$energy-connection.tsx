import { EnergyConnectionDetail } from '@energy-broker/components';
import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/connections/$energy-connection')({
  beforeLoad: ({ context, location }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({
        search: { redirect: location.href },
        to: '/',
      });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { 'energy-connection': connectionIdParam } = Route.useParams();
  return <EnergyConnectionDetail connectionId={Number(connectionIdParam)} />;
}
