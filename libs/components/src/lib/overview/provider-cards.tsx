import './provider-cards.scss';
import { Card } from 'react-bootstrap';
import { ProviderDetail } from './use-energy-dashboard';
import { useNavigate } from '@tanstack/react-router';

const PROVIDER_COLORS = [
  'rgba(13, 148, 136, 0.7)',
  'rgba(8, 145, 178, 0.7)',
  'rgba(22, 163, 74, 0.7)',
  'rgba(217, 119, 6, 0.7)',
  'rgba(71, 85, 105, 0.7)',
  'rgba(124, 58, 237, 0.7)',
];

interface ProviderCardsProps {
  providers: ProviderDetail[]
}

export function ProviderCards({ providers }: ProviderCardsProps) {
  const navigate = useNavigate();

  if (!providers.length) return null;

  return (
    <div className="mb-3">
      <div className="provider-cards__title">Your Providers</div>
      {providers.map((provider, i) => {
        const deltaLabel = provider.costDeltaPct !== null
          ? `${provider.costDeltaPct > 0 ? '▲' : '▼'} ${Math.abs(provider.costDeltaPct).toFixed(1)}%`
          : null;
        const deltaClass = provider.costDeltaPct === null || provider.costDeltaPct === 0
          ? 'text-body-secondary'
          : provider.costDeltaPct < 0
            ? 'text-success'
            : 'text-danger';

        return (
          <Card
            className="provider-card"
            key={provider.label}
            onClick={() => navigate({
              params: { 'energy-connection': String(provider.connectionId) },
              to: '/connections/$energy-connection',
            })}
          >
            <Card.Body>
              <div className="provider-card__header">
                <div>
                  <div className="provider-card__name">{provider.label}</div>
                  <div className="provider-card__type">
                    {`${provider.meterCount} meter${provider.meterCount !== 1 ? 's' : ''}`}
                  </div>
                </div>
                <div>
                  <div className="provider-card__cost">
                    {`$${provider.costDollars.toFixed(2)}`}
                  </div>
                  {deltaLabel && (
                    <div className={`provider-card__delta ${deltaClass}`}>
                      {deltaLabel}
                    </div>
                  )}
                </div>
              </div>
              <div className="provider-card__stats">
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
              <div className="provider-card__bar-track">
                <div
                  className="provider-card__bar-fill"
                  style={{
                    backgroundColor: PROVIDER_COLORS[i % PROVIDER_COLORS.length],
                    width: `${provider.shareOfSpendPct}%`,
                  }}
                />
              </div>
            </Card.Body>
          </Card>
        );
      })}
    </div>
  );
}
