import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/sources/$energy-source')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/sources/$energy-source"!</div>
}
