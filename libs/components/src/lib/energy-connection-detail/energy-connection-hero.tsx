// libs/components/src/lib/energy-connection-detail/energy-connection-hero.tsx
import './energy-connection-hero.scss';
import { Card } from 'react-bootstrap';
import { DashboardStats } from '../shared/use-energy-dashboard';
import { EnergyProviderConnectionResponse } from '@energy-broker/shared';
import { UnitTooltip } from '../shared/unit-tooltip';

interface EnergyConnectionHeroProps {
  connection: EnergyProviderConnectionResponse
  periodLabel: string
  stats: DashboardStats
}

export function EnergyConnectionHero({ connection, periodLabel, stats }: EnergyConnectionHeroProps) {
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
    ? 'energy-connection-hero__delta-value--neutral'
    : deltaPct < 0
      ? 'energy-connection-hero__delta-value--down'
      : 'energy-connection-hero__delta-value--up';

  return (
    <Card className="energy-connection-hero">
      <Card.Body className="py-4">
        <div className="energy-connection-hero__title-row">
          <span className="energy-connection-hero__name">{providerName}</span>
          <span className={`energy-connection-hero__badge energy-connection-hero__badge--${expired ? 'expired' : 'active'}`}>
            {expired ? 'Expired' : 'Active'}
          </span>
        </div>
        <div className="energy-connection-hero__subtitle">
          {connection.energyProvider.type}
          {' · Connected '}
          {connectedDate}
        </div>
        <div className="energy-connection-hero__cost">
          {`$${stats.totalCostDollars.toFixed(2)}`}
        </div>
        {deltaLabel && (
          <div className="energy-connection-hero__delta">
            <span className={deltaClass}>{deltaLabel}</span>
            {' vs prior period'}
          </div>
        )}
        <div className="energy-connection-hero__secondary">
          <div>
            <div className="energy-connection-hero__secondary-label">Usage</div>
            <div className="energy-connection-hero__secondary-value">
              {stats.totalConsumptionKwh.toLocaleString(undefined, { maximumFractionDigits: 1 })}
              {' '}
              <UnitTooltip unit="kWh" />
            </div>
          </div>
          <div>
            <div className="energy-connection-hero__secondary-label">Emissions</div>
            <div className="energy-connection-hero__secondary-value">
              {stats.emissionsMtCo2.toFixed(2)}
              {' '}
              <UnitTooltip unit="MT" />
            </div>
          </div>
          <div>
            <div className="energy-connection-hero__secondary-label">Avg Rate</div>
            <div className="energy-connection-hero__secondary-value">
              {`$${costPerKWh.toFixed(3)}`}
              <span style={{ opacity: 0.6 }}>/kWh</span>
            </div>
          </div>
          <div>
            <div className="energy-connection-hero__secondary-label">Period</div>
            <div className="energy-connection-hero__secondary-value">{periodLabel}</div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}
