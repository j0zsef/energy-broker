// libs/components/src/lib/connection-detail/connection-hero.tsx
import './connection-hero.scss';
import { Card } from 'react-bootstrap';
import { DashboardStats } from '../overview/use-energy-dashboard';
import { EnergyProviderConnectionResponse } from '@energy-broker/shared';
import { UnitTooltip } from '../shared/unit-tooltip';

interface ConnectionHeroProps {
  connection: EnergyProviderConnectionResponse
  periodLabel: string
  stats: DashboardStats
}

export function ConnectionHero({ connection, periodLabel, stats }: ConnectionHeroProps) {
  const expired = new Date(connection.expiresAt) < new Date();
  const providerName = connection.energyProvider.fullName || connection.energyProvider.name;
  const connectedDate = new Date(connection.createdAt).toLocaleDateString('en-US');
  const costPerKWh = stats.totalConsumptionKwh > 0
    ? stats.totalCostDollars / stats.totalConsumptionKwh
    : 0;

  const deltaPct = stats.deltas.costPct;
  const deltaLabel = deltaPct !== null
    ? `${deltaPct > 0 ? '▲' : '▼'} ${Math.abs(deltaPct).toFixed(1)}%`
    : null;

  const deltaClass = deltaPct === null || deltaPct === 0
    ? 'connection-hero__delta-value--neutral'
    : deltaPct < 0
      ? 'connection-hero__delta-value--down'
      : 'connection-hero__delta-value--up';

  return (
    <Card className="connection-hero">
      <Card.Body className="py-4">
        <div className="connection-hero__title-row">
          <span className="connection-hero__name">{providerName}</span>
          <span className={`connection-hero__badge connection-hero__badge--${expired ? 'expired' : 'active'}`}>
            {expired ? 'Expired' : 'Active'}
          </span>
        </div>
        <div className="connection-hero__subtitle">
          {connection.energyProvider.type}
          {' · Connected '}
          {connectedDate}
        </div>
        <div className="connection-hero__cost">
          {`$${stats.totalCostDollars.toFixed(2)}`}
        </div>
        {deltaLabel && (
          <div className="connection-hero__delta">
            <span className={deltaClass}>{deltaLabel}</span>
            {' vs prior period'}
          </div>
        )}
        <div className="connection-hero__secondary">
          <div>
            <div className="connection-hero__secondary-label">Usage</div>
            <div className="connection-hero__secondary-value">
              {stats.totalConsumptionKwh.toLocaleString(undefined, { maximumFractionDigits: 1 })}
              {' '}
              <UnitTooltip unit="kWh" />
            </div>
          </div>
          <div>
            <div className="connection-hero__secondary-label">Emissions</div>
            <div className="connection-hero__secondary-value">
              {stats.emissionsMtCo2.toFixed(2)}
              {' '}
              <UnitTooltip unit="MT" />
            </div>
          </div>
          <div>
            <div className="connection-hero__secondary-label">Avg Rate</div>
            <div className="connection-hero__secondary-value">
              {`$${costPerKWh.toFixed(3)}`}
              <span style={{ opacity: 0.6 }}>/kWh</span>
            </div>
          </div>
          <div>
            <div className="connection-hero__secondary-label">Period</div>
            <div className="connection-hero__secondary-value">{periodLabel}</div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}
