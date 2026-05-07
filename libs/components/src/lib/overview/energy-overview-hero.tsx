import './energy-overview-hero.scss';
import { Card } from 'react-bootstrap';
import { DashboardStats } from '../shared/use-energy-dashboard';
import { DeltaBadge } from '../shared/delta-badge';
import { UnitTooltip } from '../shared/unit-tooltip';

interface EnergyOverviewHeroProps {
  activeProviderCount: number
  periodLabel: string
  stats: DashboardStats
}

export function EnergyOverviewHero({ activeProviderCount, periodLabel, stats }: EnergyOverviewHeroProps) {
  const deltaPct = stats.deltas.costPct;
  const deltaColorClass = deltaPct === null || deltaPct === 0
    ? 'energy-overview-hero__delta--neutral'
    : deltaPct < 0
      ? 'energy-overview-hero__delta--down'
      : 'energy-overview-hero__delta--up';

  return (
    <Card className="energy-overview-hero">
      <Card.Body className="py-4">
        <div className="energy-overview-hero__label">Your energy spend</div>
        <div className="energy-overview-hero__value">
          {`$${stats.totalCostDollars.toFixed(2)}`}
        </div>
        <div className="energy-overview-hero__period">{periodLabel}</div>
        {deltaPct !== null && (
          <div className="energy-overview-hero__delta">
            <DeltaBadge colorClassName={deltaColorClass} value={deltaPct} />
            {' vs prior period'}
          </div>
        )}
        <div className="energy-overview-hero__secondary">
          <div>
            <div className="energy-overview-hero__secondary-label">Usage</div>
            <div className="energy-overview-hero__secondary-value">
              {stats.totalConsumptionKwh.toLocaleString(undefined, { maximumFractionDigits: 1 })}
              {' '}
              <UnitTooltip unit="kWh" />
            </div>
          </div>
          <div>
            <div className="energy-overview-hero__secondary-label">Carbon</div>
            <div className="energy-overview-hero__secondary-value">
              {stats.emissionsMtCo2.toFixed(2)}
              {' '}
              <UnitTooltip unit="MT" />
            </div>
          </div>
          <div>
            <div className="energy-overview-hero__secondary-label">Providers</div>
            <div className="energy-overview-hero__secondary-value">
              {`${activeProviderCount} active`}
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}
