import './hero-cost-card.scss';
import { Card } from 'react-bootstrap';
import { DashboardStats } from './use-energy-dashboard';
import { UnitTooltip } from '../shared/unit-tooltip';

interface HeroCostCardProps {
  activeProviderCount: number
  periodLabel: string
  stats: DashboardStats
}

export function HeroCostCard({ activeProviderCount, periodLabel, stats }: HeroCostCardProps) {
  const deltaPct = stats.deltas.costPct;
  const deltaLabel = deltaPct !== null
    ? `${deltaPct > 0 ? '▲' : '▼'} ${Math.abs(deltaPct).toFixed(1)}%`
    : null;

  const deltaClass = deltaPct === null || deltaPct === 0
    ? 'hero-cost-card__delta-value--neutral'
    : deltaPct < 0
      ? 'hero-cost-card__delta-value--down'
      : 'hero-cost-card__delta-value--up';

  return (
    <Card className="hero-cost-card">
      <Card.Body className="py-4">
        <div className="hero-cost-card__label">Your energy spend</div>
        <div className="hero-cost-card__value">
          {`$${stats.totalCostDollars.toFixed(2)}`}
        </div>
        <div className="hero-cost-card__period">{periodLabel}</div>
        {deltaLabel && (
          <div className="hero-cost-card__delta">
            <span className={deltaClass}>{deltaLabel}</span>
            {' vs prior period'}
          </div>
        )}
        <div className="hero-cost-card__secondary">
          <div>
            <div className="hero-cost-card__secondary-label">Usage</div>
            <div className="hero-cost-card__secondary-value">
              {stats.totalConsumptionKwh.toLocaleString(undefined, { maximumFractionDigits: 1 })}
              {' '}
              <UnitTooltip unit="kWh" />
            </div>
          </div>
          <div>
            <div className="hero-cost-card__secondary-label">Carbon</div>
            <div className="hero-cost-card__secondary-value">
              {stats.emissionsMtCo2.toFixed(2)}
              {' '}
              <UnitTooltip unit="MT" />
            </div>
          </div>
          <div>
            <div className="hero-cost-card__secondary-label">Providers</div>
            <div className="hero-cost-card__secondary-value">
              {`${activeProviderCount} active`}
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}
