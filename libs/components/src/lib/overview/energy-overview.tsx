import { fetchEnergySummary, useEnergyUsage } from '@energy-broker/api-client';
import { Button } from 'react-bootstrap';
import { Link } from '@tanstack/react-router';
import { useQueries } from '@tanstack/react-query';

// EnergyOverview component to display electrical meter summaries for now,
// this component will be expanded later to include more energy sources
export function EnergyOverview() {
  const { data: electricalMeters = [], isLoading } = useEnergyUsage({ connectionId: 0 });

  const summaryQueries = useQueries({
    queries: electricalMeters
      .filter(meter => !!meter.meterId)
      .map(meter => ({
        queryFn: () => fetchEnergySummary({ connectionId: 0, meterId: meter.meterId as string }),
        queryKey: ['electricalSummary', meter.meterId],
      })),
  });

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

  const allSummaries = summaryQueries.map(q => q.data).filter(Boolean);

  return (
    <div>
      {allSummaries.map((summary, idx) => (
        <div key={idx}>{JSON.stringify(summary)}</div>
      ))}
    </div>
  );
}
