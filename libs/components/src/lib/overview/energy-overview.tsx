import { Alert, Col, Row } from 'react-bootstrap';
import { TimePeriod, useEnergyDashboard } from './use-energy-dashboard';
import { fetchEnergySummary, useEnergyConnections, useEnergyUsage } from '@energy-broker/api-client';
import { useCallback, useState } from 'react';
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

  const allSummaries = summaryQueries.map(q => q.data);
  const summariesLoading = summaryQueries.some(q => q.isLoading);
  const filteredMeters = electricalMeters.filter(meter => !!meter.meterId);

  const { energyMix, monthlyConsumption, stats } = useEnergyDashboard(
    allSummaries, filteredMeters, selectedPeriod, firstConnection?.id ?? 0,
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

  if (connectionsLoading || usageLoading) {
    return <PageSpinner />;
  }

  if (!activeConnections.length) {
    return <EnergyEmptyState />;
  }

  if (!electricalMeters.length) {
    return (
      <Alert variant="warning">
        {'No energy usage data available for '}
        {firstConnection.energyProvider.fullName}
        .
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
