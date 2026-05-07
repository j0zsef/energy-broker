import { EnergyProviderConnectionResponse } from '@energy-broker/shared';
import { fetchEnergySummary, fetchEnergyUsage } from '@energy-broker/api-client';
import { MeterEntry } from './use-energy-dashboard';
import { useQueries } from '@tanstack/react-query';

export function useAllConnectionsMeterEntries(connections: EnergyProviderConnectionResponse[]) {
  // Fetch usage points (meter list) for each connection in parallel
  const usagePointQueries = useQueries({
    queries: connections.map(conn => ({
      enabled: !!conn.id,
      queryFn: () => fetchEnergyUsage({ connectionId: conn.id }),
      queryKey: ['electricalMeters', conn.id],
    })),
  });

  const usagePointsLoading = usagePointQueries.some(q => q.isLoading);

  // Flatten usage points into meter metadata across all connections
  const meterMetadata = connections.flatMap((conn, connIdx) => {
    const meters = usagePointQueries[connIdx]?.data ?? [];
    return meters
      .filter(meter => !!meter.meterId)
      .map(meter => ({
        connectionId: conn.id,
        connectionLabel: conn.energyProvider.fullName || conn.energyProvider.name,
        meterId: meter.meterId as string,
        meterTitle: meter.title ?? 'Unknown Meter',
      }));
  });

  // Fetch billing summaries for each meter in parallel
  const summaryQueries = useQueries({
    queries: meterMetadata.map(entry => ({
      queryFn: () => fetchEnergySummary({ connectionId: entry.connectionId, meterId: entry.meterId }),
      queryKey: ['electricalSummary', entry.connectionId, entry.meterId],
    })),
  });

  const summariesLoading = summaryQueries.some(q => q.isLoading);

  const meterEntries: MeterEntry[] = meterMetadata.map((entry, idx) => ({
    connectionId: entry.connectionId,
    connectionLabel: entry.connectionLabel,
    meterId: entry.meterId,
    meterTitle: entry.meterTitle,
    summaries: summaryQueries[idx]?.data,
  }));

  return { meterEntries, meterMetadata, summariesLoading, usagePointsLoading };
}
