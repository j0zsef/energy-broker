import { MeterEntry, TimePeriod, useEnergyDashboard } from './use-energy-dashboard';
import { fetchEnergySummary, fetchEnergyUsage, useCarbonOrders, useEnergyConnections } from '@energy-broker/api-client';
import { Alert } from 'react-bootstrap';
import { CarbonNudge } from './carbon-nudge';
import { CostTrendChart } from './cost-trend-chart';
import { EnergyEmptyState } from './energy-empty-state';
import { EnergyProviderContext } from './energy-provider-context';
import { EnergyTimePeriodTabs } from './energy-time-period-tabs';
import { HeroCostCard } from './hero-cost-card';
import { PageSpinner } from '../shared/page-spinner';
import { ProviderCards } from './provider-cards';
import { useQueries } from '@tanstack/react-query';
import { useState } from 'react';

export function EnergyOverview() {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('3m');

  const { data: connections = [], isLoading: connectionsLoading } = useEnergyConnections();
  const { data: carbonSummary } = useCarbonOrders();
  const activeConnections = connections.filter(c => new Date(c.expiresAt) > new Date());

  const meterQueries = useQueries({
    queries: activeConnections.map(conn => ({
      enabled: !!conn.id,
      queryFn: () => fetchEnergyUsage({ connectionId: conn.id }),
      queryKey: ['electricalMeters', conn.id],
    })),
  });

  const metersLoading = meterQueries.some(q => q.isLoading);

  const allMeterEntries = activeConnections.flatMap((conn, connIdx) => {
    const meters = meterQueries[connIdx]?.data ?? [];
    return meters
      .filter(meter => !!meter.meterId)
      .map(meter => ({
        connectionId: conn.id,
        connectionLabel: conn.energyProvider.fullName || conn.energyProvider.name,
        meterId: meter.meterId as string,
        meterTitle: meter.title ?? 'Unknown Meter',
      }));
  });

  const summaryQueries = useQueries({
    queries: allMeterEntries.map(entry => ({
      queryFn: () => fetchEnergySummary({ connectionId: entry.connectionId, meterId: entry.meterId }),
      queryKey: ['electricalSummary', entry.connectionId, entry.meterId],
    })),
  });

  const summariesLoading = summaryQueries.some(q => q.isLoading);

  const dashboardEntries: MeterEntry[] = allMeterEntries.map((entry, idx) => ({
    connectionId: entry.connectionId,
    connectionLabel: entry.connectionLabel,
    meterTitle: entry.meterTitle,
    summaries: summaryQueries[idx]?.data,
  }));

  const { monthlyCost, periodLabel, providerDetails, stats } = useEnergyDashboard(
    dashboardEntries, selectedPeriod,
  );

  if (connectionsLoading || metersLoading) {
    return <PageSpinner />;
  }

  if (!activeConnections.length) {
    return <EnergyEmptyState />;
  }

  if (allMeterEntries.length === 0) {
    return (
      <Alert variant="warning">
        No energy usage data available for your connected providers.
      </Alert>
    );
  }

  if (summariesLoading) {
    return <PageSpinner label="Loading energy data..." />;
  }

  return (
    <div>
      <EnergyProviderContext connections={activeConnections} />
      <HeroCostCard
        activeProviderCount={providerDetails.length}
        periodLabel={periodLabel}
        stats={stats}
      />
      <EnergyTimePeriodTabs onSelect={setSelectedPeriod} selectedPeriod={selectedPeriod} />
      {monthlyCost.labels.length > 1 && (
        <CostTrendChart monthlyCost={monthlyCost} providerDetails={providerDetails} />
      )}
      <ProviderCards providers={providerDetails} />
      <CarbonNudge
        carbonSummary={carbonSummary}
        emissionsMtCo2={stats.emissionsMtCo2}
      />
    </div>
  );
}
