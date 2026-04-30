// libs/components/src/lib/connection-detail/meter-breakdown.tsx
import './meter-breakdown.scss';
import { Card } from 'react-bootstrap';
import { MeterDetail } from '@energy-broker/shared';

interface MeterBreakdownProps {
  meters: MeterDetail[]
  periodLabel: string
}

export function MeterBreakdown({ meters, periodLabel }: MeterBreakdownProps) {
  if (meters.length === 0) return null;

  const isSingle = meters.length === 1;

  return (
    <div className="mb-3">
      <div className="meter-breakdown__title">
        {isSingle ? 'Meter Details' : 'Meter Breakdown'}
      </div>
      <div className="meter-breakdown__subtitle">
        {isSingle
          ? `${meters[0].meterTitle} for ${periodLabel}`
          : `Usage split across ${meters.length} meters for ${periodLabel}`}
      </div>
      <div className="meter-breakdown__grid">
        {meters.map((meter) => {
          const deltaLabel = meter.costDeltaPct !== null
            ? `${meter.costDeltaPct > 0 ? '▲' : '▼'} ${Math.abs(meter.costDeltaPct).toFixed(1)}%`
            : null;
          const deltaClass = meter.costDeltaPct === null || meter.costDeltaPct === 0
            ? 'text-body-secondary'
            : meter.costDeltaPct < 0
              ? 'text-success'
              : 'text-danger';

          return (
            <Card className="meter-card" key={meter.meterId}>
              <Card.Body>
                <div className="meter-card__header">
                  <span className="meter-card__name">{meter.meterTitle}</span>
                  <span className="meter-card__share">
                    {`${meter.shareOfSpendPct.toFixed(0)}% of spend`}
                  </span>
                </div>
                <div className="meter-card__cost">
                  {`$${meter.costDollars.toFixed(2)}`}
                  {deltaLabel && (
                    <span className={`meter-card__delta ${deltaClass}`}>{deltaLabel}</span>
                  )}
                </div>
                <div className="meter-card__stats">
                  <div>
                    <div className="meter-card__stats-label">Usage</div>
                    <div className="meter-card__stats-value">
                      {meter.kWh.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                      {' kWh'}
                    </div>
                  </div>
                  <div>
                    <div className="meter-card__stats-label">Rate</div>
                    <div className="meter-card__stats-value">
                      {`$${meter.costPerKWh.toFixed(3)}/kWh`}
                    </div>
                  </div>
                  <div>
                    <div className="meter-card__stats-label">Emissions</div>
                    <div className="meter-card__stats-value">
                      {meter.emissionsMtCo2.toFixed(2)}
                      {' MT'}
                    </div>
                  </div>
                </div>
                <div className="meter-card__bar-track">
                  <div
                    className="meter-card__bar-fill"
                    style={{ width: `${meter.shareOfSpendPct}%` }}
                  />
                </div>
              </Card.Body>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
