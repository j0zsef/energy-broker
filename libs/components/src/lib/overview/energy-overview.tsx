import { Alert, Col, Row } from 'react-bootstrap';
import { MeterEntry, TimePeriod, useEnergyDashboard } from './use-energy-dashboard';
import { fetchEnergySummary, fetchEnergyUsage, useCarbonOrders, useEnergyConnections } from '@energy-broker/api-client';
import { useCallback, useState } from 'react';
import { EmissionsStatsCards } from './emissions-stats-cards';
import { EnergyBreakdown } from './energy-breakdown';
import { EnergyConsumptionChart } from './energy-consumption-chart';
import { EnergyEmptyState } from './energy-empty-state';
import { EnergyProviderContext } from './energy-provider-context';
import { EnergyStatsCards } from './energy-stats-cards';
import { EnergyTimePeriodTabs } from './energy-time-period-tabs';
import { PageSpinner } from '../shared/page-spinner';
import { useNavigate } from '@tanstack/react-router';
import { useQueries } from '@tanstack/react-query';

export function EnergyOverview() {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('3m');

  const { data: connections = [], isLoading: connectionsLoading } = useEnergyConnections();
  const { data: carbonSummary } = useCarbonOrders();
  const activeConnections = connections.filter(c => new Date(c.expiresAt) > new Date());

  // Fetch meters for ALL active connections
  const meterQueries = useQueries({
    queries: activeConnections.map(conn => ({
      enabled: !!conn.id,
      queryFn: () => fetchEnergyUsage({ connectionId: conn.id }),
      queryKey: ['electricalMeters', conn.id],
    })),
  });

  const metersLoading = meterQueries.some(q => q.isLoading);

  // Build a flat list of { connectionId, connectionLabel, meterId, meterTitle } for all connections
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

  // Fetch summaries for ALL meters across ALL connections
  const summaryQueries = useQueries({
    queries: allMeterEntries.map(entry => ({
      queryFn: () => fetchEnergySummary({ connectionId: entry.connectionId, meterId: entry.meterId }),
      queryKey: ['electricalSummary', entry.connectionId, entry.meterId],
    })),
  });

  const summariesLoading = summaryQueries.some(q => q.isLoading);

  // Build MeterEntry[] for useEnergyDashboard
  const dashboardEntries: MeterEntry[] = allMeterEntries.map((entry, idx) => ({
    connectionId: entry.connectionId,
    connectionLabel: entry.connectionLabel,
    meterTitle: entry.meterTitle,
    summaries: summaryQueries[idx]?.data,
  }));

  const { energyMix, monthlyConsumption, stats } = useEnergyDashboard(
    dashboardEntries, selectedPeriod,
  );

  const handleSegmentClick = useCallback((index: number) => {
    const entry = energyMix[index];
    if (entry?.connectionId) {
      navigate({
        params: { 'energy-connection': String(entry.connectionId) },
        to: '/connections/$energy-connection',
      });
    }
  }, [energyMix, navigate]);

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
      <EnergyTimePeriodTabs onSelect={setSelectedPeriod} selectedPeriod={selectedPeriod} />
      <EnergyStatsCards stats={stats} />
      {carbonSummary && (
        <EmissionsStatsCards
          creditsUsedMtCo2={carbonSummary.totalOffsetMtCo2}
          emissionsMtCo2={stats.emissionsMtCo2}
        />
      )}
      <Row className="g-3">
        <Col lg={7}>
          <EnergyConsumptionChart monthlyConsumption={monthlyConsumption} />
        </Col>
        <Col lg={5}>
          <EnergyBreakdown energyMix={energyMix} onSegmentClick={handleSegmentClick} />
        </Col>
      </Row>
    </div>
  );
}
