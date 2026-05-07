// libs/components/src/lib/energy-connection-detail/energy-connection-detail.tsx
import { CostTrendChart } from '../overview/cost-trend-chart';
import { EnergyConnectionHero } from './energy-connection-hero';
import { EnergyMeterBreakdown } from './energy-meter-breakdown';
import { EnergyTimePeriodTabs } from '../overview/energy-time-period-tabs';
import { Link } from '@tanstack/react-router';
import { PageSpinner } from '../shared/page-spinner';
import { TimePeriod, useEnergyDashboard } from '../overview/use-energy-dashboard';
import { useConnectionMeterEntries } from '../overview/use-connection-meter-entries';
import { useEnergyConnections } from '@energy-broker/api-client';
import { useState } from 'react';
import { Alert } from 'react-bootstrap';

interface EnergyConnectionDetailProps {
  connectionId: number;
}

export function EnergyConnectionDetail({ connectionId }: EnergyConnectionDetailProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('3m');

  const { data: connections = [], isLoading: connectionsLoading } = useEnergyConnections();
  const connection = connections.find(c => c.id === connectionId);

  const connectionLabel = connection
    ? (connection.energyProvider.fullName || connection.energyProvider.name)
    : '';

  const { meterEntries, meterMetadata, summariesLoading, usageLoading } = useConnectionMeterEntries(
    connectionId, connectionLabel,
  );

  const { meterDetails, monthlyCost, periodLabel, providerDetails, stats } = useEnergyDashboard(
    meterEntries, selectedPeriod,
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

  return (
    <>
      <Link className="text-decoration-none mb-3 d-inline-block" to="/">
        ← Back to Overview
      </Link>

      <EnergyConnectionHero
        connection={connection}
        periodLabel={periodLabel}
        stats={stats}
      />

      {summariesLoading
        ? <PageSpinner label="Loading energy data..." />
        : meterMetadata.length === 0
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
                  <EnergyMeterBreakdown meters={meterDetails} periodLabel={periodLabel} />
                )}
              </>
            )}
    </>
  );
}
