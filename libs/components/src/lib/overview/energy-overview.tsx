import { fetchEnergySummary, useEnergyConnections, useEnergyUsage } from '@energy-broker/api-client';
import { Button } from 'react-bootstrap';
import { Link } from '@tanstack/react-router';
import { useQueries } from '@tanstack/react-query';

// EnergyOverview component to display electrical meter summaries for now,
// this component will be expanded later to include more energy sources
export function EnergyOverview() {
  const { data: connections = [], isLoading: connectionsLoading } = useEnergyConnections();
  const activeConnections = connections.filter(c => new Date(c.expiresAt) > new Date());
  const firstConnection = activeConnections[0];

  const { data: electricalMeters = [], isLoading: usageLoading } = useEnergyUsage({
    connectionId: firstConnection?.id ?? -1,
    enabled: !!firstConnection,
  });

  const summaryQueries = useQueries({
    queries: electricalMeters
      .filter(meter => !!meter.meterId)
      .map(meter => ({
        queryFn: () => fetchEnergySummary({ connectionId: firstConnection.id, meterId: meter.meterId as string }),
        queryKey: ['electricalSummary', firstConnection.id, meter.meterId],
      })),
  });

  if (connectionsLoading || usageLoading) {
    return <div>Loading...</div>;
  }

  if (!activeConnections.length) {
    return (
      <>
        <div>No active energy connections found.</div>
        <Link to="/connections/add">
          <Button>Add energy connection</Button>
        </Link>
      </>
    );
  }

  if (!electricalMeters.length) {
    return (
      <div>
        {'No energy usage data available for '}
        {firstConnection.energyProvider.fullName}
        .
      </div>
    );
  }

  const allSummaries = summaryQueries.map(q => q.data).filter(Boolean);

  return (
    <div>
      {allSummaries.map((summary, idx) => (
        <div key={idx}>{JSON.stringify(summary)}</div>
      ))}
    </div>
  );
}
