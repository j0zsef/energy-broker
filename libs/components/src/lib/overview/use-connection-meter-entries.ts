import { fetchEnergySummary, useEnergyUsage } from '@energy-broker/api-client';
import { MeterEntry } from './use-energy-dashboard';
import { useQueries } from '@tanstack/react-query';

export function useConnectionMeterEntries(connectionId: number, connectionLabel: string) {
  const { data: usagePoints = [], isLoading: usageLoading } = useEnergyUsage({
    connectionId,
    enabled: !!connectionId,
  });

  const meterMetadata = usagePoints
    .filter(m => !!m.meterId)
    .map((m, idx) => ({
      connectionId,
      connectionLabel,
      meterId: m.meterId as string,
      meterTitle: m.title ?? `Meter ${idx + 1}`,
    }));

  const summaryQueries = useQueries({
    queries: meterMetadata.map(entry => ({
      queryFn: () => fetchEnergySummary({ connectionId, meterId: entry.meterId }),
      queryKey: ['electricalSummary', connectionId, entry.meterId],
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

  return { meterEntries, meterMetadata, summariesLoading, usageLoading };
}
