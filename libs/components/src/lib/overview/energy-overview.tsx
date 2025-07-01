import { useElectricalMeters, useElectricalSummary } from '@energy-broker/api-client';
import { useQueries } from '@tanstack/react-query';

export function EnergyOverview() {
  // const min = '2022-09-27T18:00:00Z';
  // const max = '2025-07-01T19:00:00Z';
  const { data: electricalMeters = [], isLoading } = useElectricalMeters({});

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!electricalMeters.length) {
    return <div>No electrical meters found.</div>;
  }

  const summaryQueries = useQueries({
    queries: electricalMeters.map(meter => ({
      enabled: !!meter.meterId,
      queryFn: () => useElectricalSummary({ meterId: meter.meterId as string }),
      queryKey: ['electricalSummary', meter.meterId],
    })),
  });

  // Aggregate summaries as needed
  const allSummaries = summaryQueries.map(q => q.data).filter(Boolean);

  return (
    <div>
      <h2>Energy Overview</h2>
      {allSummaries.map((summary, idx) => (
        <div key={idx}>{JSON.stringify(summary)}</div>
      ))}
    </div>
  );
}
