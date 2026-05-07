import { TimePeriod, useEnergyDashboard } from '../shared/use-energy-dashboard';
import { useCarbonOrders, useEnergyConnections } from '@energy-broker/api-client';
import { Alert } from 'react-bootstrap';
import { CarbonNudge } from './carbon-nudge';
import { CostTrendChart } from '../shared/cost-trend-chart';
import { EnergyEmptyState } from './energy-empty-state';
import { EnergyProviderContext } from './energy-provider-context';
import { EnergyTimePeriodTabs } from '../shared/energy-time-period-tabs';
import { HeroCostCard } from './hero-cost-card';
import { PageSpinner } from '../shared/page-spinner';
import { ProviderCards } from './provider-cards';
import { useAllEnergyConnectionsMeterEntries } from './use-all-energy-connections-meter-entries';
import { useState } from 'react';

// EnergyOverview data pipeline:
// 1. Fetch connections & carbon orders
// 2. Fetch meter entries across all active connections (useAllEnergyConnectionsMeterEntries)
// 3. Derive stats, charts, and provider breakdowns (useEnergyDashboard)
export function EnergyOverview() {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('3m');

  // 1. Connections & orders
  const { data: connections = [], isLoading: connectionsLoading } = useEnergyConnections();
  const { data: carbonSummary } = useCarbonOrders();
  const activeConnections = connections.filter(c => new Date(c.expiresAt) > new Date());

  // 2. Meter entries across all active connections
  const { meterEntries, meterMetadata, summariesLoading, usagePointsLoading } = useAllEnergyConnectionsMeterEntries(
    activeConnections,
  );

  // 3. Derived dashboard data
  const { dashboardStats, filteredMeters, periodLabel, providerDetails } = useEnergyDashboard(
    meterEntries, selectedPeriod,
  );

  if (connectionsLoading || usagePointsLoading) {
    return <PageSpinner />;
  }

  if (!activeConnections.length) {
    return <EnergyEmptyState />;
  }

  if (meterMetadata.length === 0) {
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
        stats={dashboardStats}
      />
      <EnergyTimePeriodTabs onSelect={setSelectedPeriod} selectedPeriod={selectedPeriod} />
      <CostTrendChart filteredMeters={filteredMeters} />
      <ProviderCards providers={providerDetails} />
      <CarbonNudge
        carbonSummary={carbonSummary}
        emissionsMtCo2={dashboardStats.emissionsMtCo2}
      />
    </div>
  );
}
