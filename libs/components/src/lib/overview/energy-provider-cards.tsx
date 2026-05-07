import './energy-provider-cards.scss';
import { Card } from 'react-bootstrap';
import { DeltaBadge } from '../shared/delta-badge';
import { ProviderDetail } from '../shared/use-energy-dashboard';
import { useNavigate } from '@tanstack/react-router';

const PROVIDER_COLORS = [
  'rgba(13, 148, 136, 0.7)',
  'rgba(8, 145, 178, 0.7)',
  'rgba(22, 163, 74, 0.7)',
  'rgba(217, 119, 6, 0.7)',
  'rgba(71, 85, 105, 0.7)',
  'rgba(124, 58, 237, 0.7)',
];

interface EnergyProviderCardsProps {
  providers: ProviderDetail[]
}

export function EnergyProviderCards({ providers }: EnergyProviderCardsProps) {
  const navigate = useNavigate();

  if (!providers.length) return null;

  return (
    <div className="mb-3">
      <div className="energy-provider-cards__title">Your Providers</div>
      {providers.map((provider, i) => (
        <Card
          className="energy-provider-card"
          key={provider.label}
          onClick={() => navigate({
            params: { 'energy-connection': String(provider.connectionId) },
            to: '/connections/$energy-connection',
          })}
        >
          <Card.Body>
            <div className="energy-provider-card__header">
              <div>
                <div className="energy-provider-card__name">{provider.label}</div>
                <div className="energy-provider-card__type">
                  {`${provider.meterCount} meter${provider.meterCount !== 1 ? 's' : ''}`}
                </div>
              </div>
              <div>
                <div className="energy-provider-card__cost">
                  {`$${provider.costDollars.toFixed(2)}`}
                </div>
                <div className="energy-provider-card__delta">
                  <DeltaBadge value={provider.costDeltaPct} />
                </div>
              </div>
            </div>
            <div className="energy-provider-card__stats">
              <span>
                {provider.kWh.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                {' kWh'}
              </span>
              <span>
                {provider.emissionsMtCo2.toFixed(2)}
                {' MT CO₂'}
              </span>
              <span>
                {`${provider.shareOfSpendPct.toFixed(0)}% of spend`}
              </span>
            </div>
            <div className="energy-provider-card__bar-track">
              <div
                className="energy-provider-card__bar-fill"
                style={{
                  backgroundColor: PROVIDER_COLORS[i % PROVIDER_COLORS.length],
                  width: `${provider.shareOfSpendPct}%`,
                }}
              />
            </div>
          </Card.Body>
        </Card>
      ))}
    </div>
  );
}
