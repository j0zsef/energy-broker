import {
  CARBON_LBS_PER_KWH,
  ConnectionHero,
  CostTrendChart,
  EnergyTimePeriodTabs,
  MeterBreakdown,
  MeterEntry,
  PageSpinner,
  TimePeriod,
  filterByPeriod,
  filterPreviousPeriod,
  parseSummary,
  pctChange,
  useEnergyDashboard,
} from '@energy-broker/components';
import { LBS_TO_METRIC_TONS, MeterDetail } from '@energy-broker/shared';
import { Link, createFileRoute, redirect } from '@tanstack/react-router';
import { fetchEnergySummary, useEnergyConnections, useEnergyUsage } from '@energy-broker/api-client';
import { useMemo, useState } from 'react';
import { Alert } from 'react-bootstrap';
import { useQueries } from '@tanstack/react-query';

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
  const connectionId = Number(connectionIdParam);
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('3m');

  const { data: connections = [], isLoading: connectionsLoading } = useEnergyConnections();
  const connection = connections.find(c => c.id === connectionId);

  const { data: electricalMeters = [], isLoading: usageLoading } = useEnergyUsage({
    connectionId,
    enabled: !!connection,
  });

  const filteredMeters = electricalMeters.filter(meter => !!meter.meterId);

  const summaryQueries = useQueries({
    queries: filteredMeters.map(meter => ({
      queryFn: () => fetchEnergySummary({ connectionId, meterId: meter.meterId as string }),
      queryKey: ['electricalSummary', connectionId, meter.meterId],
    })),
  });

  const summariesLoading = summaryQueries.some(q => q.isLoading);

  const connectionLabel = connection
    ? (connection.energyProvider.fullName || connection.energyProvider.name)
    : '';

  const meterEntries: MeterEntry[] = filteredMeters.map((meter, idx) => ({
    connectionId,
    connectionLabel,
    meterTitle: meter.title ?? `Meter ${idx + 1}`,
    summaries: summaryQueries[idx]?.data,
  }));

  const { monthlyCost, periodLabel, providerDetails, stats } = useEnergyDashboard(
    meterEntries, selectedPeriod,
  );

  // Per-meter aggregation for MeterBreakdown
  const meterDetails: MeterDetail[] = useMemo(() => {
    if (filteredMeters.length === 0) return [];

    const details = filteredMeters.map((meter, idx) => {
      const summaries = summaryQueries[idx]?.data;
      if (!summaries) return null;

      const parsed = summaries
        .map(s => parseSummary(s, meter.title ?? `Meter ${idx + 1}`, connectionId, connectionLabel))
        .filter((p): p is NonNullable<typeof p> => p !== null);

      const current = filterByPeriod(parsed, selectedPeriod);
      const previous = filterPreviousPeriod(parsed, selectedPeriod);

      let costDollars = 0;
      let kWh = 0;
      for (const entry of current) {
        costDollars += entry.costDollars;
        kWh += entry.consumptionKwh;
      }

      let prevCost = 0;
      for (const entry of previous) {
        prevCost += entry.costDollars;
      }

      const emissionsMtCo2 = kWh * CARBON_LBS_PER_KWH * LBS_TO_METRIC_TONS;
      const costPerKWh = kWh > 0 ? costDollars / kWh : 0;
      const costDeltaPct = previous.length > 0 ? pctChange(costDollars, prevCost) : null;

      return {
        costDeltaPct,
        costDollars,
        costPerKWh,
        emissionsMtCo2,
        kWh,
        meterId: meter.meterId as string,
        meterTitle: meter.title ?? `Meter ${idx + 1}`,
        shareOfSpendPct: 0, // calculated below
      };
    }).filter((d): d is MeterDetail => d !== null);

    const totalCost = details.reduce((sum, d) => sum + d.costDollars, 0);
    for (const detail of details) {
      detail.shareOfSpendPct = totalCost > 0 ? (detail.costDollars / totalCost) * 100 : 0;
    }

    return details;
  }, [connectionId, connectionLabel, filteredMeters, selectedPeriod, summaryQueries]);

  if (connectionsLoading || usageLoading) {
    return <PageSpinner />;
  }

  if (!connection) {
    return (
      <Alert variant="warning">
        {'Connection not found. '}
        <Link to="/connections">Return to connections</Link>
      </Alert>
    );
  }

  return (
    <>
      <Link className="text-decoration-none mb-3 d-inline-block" to="/">
        ← Back to Overview
      </Link>

      <ConnectionHero
        connection={connection}
        periodLabel={periodLabel}
        stats={stats}
      />

      {summariesLoading
        ? <PageSpinner label="Loading energy data..." />
        : filteredMeters.length === 0
          ? (
              <Alert variant="info">No meter data available for this connection.</Alert>
            )
          : (
              <>
                <EnergyTimePeriodTabs onSelect={setSelectedPeriod} selectedPeriod={selectedPeriod} />
                {monthlyCost.labels.length > 1 && (
                  <CostTrendChart monthlyCost={monthlyCost} providerDetails={providerDetails} />
                )}
                {meterDetails.length > 0 && (
                  <MeterBreakdown meters={meterDetails} periodLabel={periodLabel} />
                )}
              </>
            )}
    </>
  );
}
