import { useEnergySummary, useEnergyUsage } from '@energy-broker/api-client';
import { Button } from 'react-bootstrap';
import { Link } from '@tanstack/react-router';
import { useQueries } from '@tanstack/react-query';

// EnergyOverview component to display electrical meter summaries for now,
// this component will be expanded later to include more energy sources
export function EnergyOverview() {
  // const min = '2022-09-27T18:00:00Z';
  // const max = '2025-07-01T19:00:00Z';
  const { data: electricalMeters = [], isLoading } = useEnergyUsage({ connectionId: 0 });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!electricalMeters.length) {
    return (
      <>
        <div>No energy usage found.</div>
        <Link to="/connections/add">
          <Button>Add energy connection</Button>
        </Link>
      </>
    );
  }

  const summaryQueries = useQueries({
    queries: electricalMeters.map(meter => ({
      enabled: !!meter.meterId,
      queryFn: () => useEnergySummary({ connectionId: 0, meterId: meter.meterId as string }),
      queryKey: ['electricalSummary', meter.meterId],
    })),
  });

  // Aggregate summaries as needed
  const allSummaries = summaryQueries.map(q => q.data).filter(Boolean);

  return (
    <div>
      {allSummaries.map((summary, idx) => (
        <div key={idx}>{JSON.stringify(summary)}</div>
      ))}
    </div>
  );
}
