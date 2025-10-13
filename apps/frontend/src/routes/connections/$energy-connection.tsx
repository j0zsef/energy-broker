import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/connections/$energy-connection')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/sources/$energy-source"!</div>;
}
