import { Button, Col, Row } from 'react-bootstrap';
import { TimePeriod, useEnergyDashboard } from './use-energy-dashboard';
import { fetchEnergySummary, useEnergyConnections, useEnergyUsage } from '@energy-broker/api-client';
import { ConsumptionChart } from './consumption-chart';
import { EnergyBreakdown } from './energy-breakdown';
import { Link } from '@tanstack/react-router';
import { StatsCards } from './stats-cards';
import { TimePeriodTabs } from './time-period-tabs';
import { useQueries } from '@tanstack/react-query';
import { useState } from 'react';

export function EnergyOverview() {
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

  const { energyMix, monthlyConsumption, stats } = useEnergyDashboard(allSummaries, filteredMeters, selectedPeriod);

  if (connectionsLoading || usageLoading) {
    return <div>Loading...</div>;
  }

  if (!activeConnections.length) {
    return (
      <>
        <div>No active energy connections found.</div>
        <Link to="/connections/add">
          <Button>Add energy connection</Button>
        </Link>
      </>
    );
  }

  if (!electricalMeters.length) {
    return (
      <div>
        {'No energy usage data available for '}
        {firstConnection.energyProvider.fullName}
        .
      </div>
    );
  }

  if (summariesLoading) {
    return <div>Loading energy data...</div>;
  }

  return (
    <div>
      <TimePeriodTabs onSelect={setSelectedPeriod} selectedPeriod={selectedPeriod} />
      <StatsCards stats={stats} />
      <Row>
        <Col lg={7}>
          <ConsumptionChart monthlyConsumption={monthlyConsumption} />
        </Col>
        <Col lg={5}>
          <EnergyBreakdown energyMix={energyMix} />
        </Col>
      </Row>
    </div>
  );
}
