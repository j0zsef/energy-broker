import { Alert, Badge, Card, Col, Row } from 'react-bootstrap';
import {
  EnergyBreakdown,
  EnergyConsumptionChart,
  EnergyStatsCards,
  EnergyTimePeriodTabs,
  PageSpinner,
  TimePeriod,
  useEnergyDashboard,
} from '@energy-broker/components';
import { Link, createFileRoute, redirect } from '@tanstack/react-router';
import { fetchEnergySummary, useEnergyConnections, useEnergyUsage } from '@energy-broker/api-client';
import { useQueries } from '@tanstack/react-query';
import { useState } from 'react';

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

  const allSummaries = summaryQueries.map(q => q.data);
  const summariesLoading = summaryQueries.some(q => q.isLoading);

  const { energyMix, monthlyConsumption, stats } = useEnergyDashboard(
    allSummaries, filteredMeters, selectedPeriod, connectionId,
  );

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

  const expired = new Date(connection.expiresAt) < new Date();

  return (
    <>
      <Link className="text-decoration-none mb-3 d-inline-block" to="/">
        {'< Back to Overview'}
      </Link>

      <Card className="mb-4">
        <Card.Body className="d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div>
            <h4 className="mb-1">{connection.energyProvider.fullName || connection.energyProvider.name}</h4>
            <span className="text-body-secondary">
              {connection.energyProvider.type}
              {' · Connected '}
              {new Date(connection.createdAt).toLocaleDateString('en-US')}
            </span>
          </div>
          <Badge bg={expired ? 'danger' : 'success'}>
            {expired ? 'Expired' : 'Active'}
          </Badge>
        </Card.Body>
      </Card>

      {summariesLoading
        ? <PageSpinner label="Loading energy data..." />
        : filteredMeters.length === 0
          ? (
              <Alert variant="info">No meter data available for this connection.</Alert>
            )
          : (
              <>
                <EnergyTimePeriodTabs onSelect={setSelectedPeriod} selectedPeriod={selectedPeriod} />
                <EnergyStatsCards stats={stats} />
                <Row className="g-3">
                  <Col lg={7}>
                    <EnergyConsumptionChart monthlyConsumption={monthlyConsumption} />
                  </Col>
                  <Col lg={5}>
                    <EnergyBreakdown energyMix={energyMix} />
                  </Col>
                </Row>
              </>
            )}
    </>
  );
}
