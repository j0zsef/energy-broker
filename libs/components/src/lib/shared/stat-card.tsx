import './stat-card.scss';
import { Card } from 'react-bootstrap';
import { ReactNode } from 'react';
import { UnitTooltip } from './unit-tooltip';

interface StatCardProps {
  children?: ReactNode
  subtitle: string
  unit?: string
  value: string
  variant?: 'default' | 'net-positive' | 'success'
}

export function StatCard({ children, subtitle, unit, value, variant = 'default' }: StatCardProps) {
  const variantClass = variant !== 'default' ? ` stat-card--${variant}` : '';

  return (
    <Card className={`stat-card${variantClass}`}>
      <Card.Body>
        <div className="stat-card__subtitle">{subtitle}</div>
        <div className="stat-card__value">
          {value}
          {unit && <UnitTooltip className="stat-card__unit" unit={unit} />}
        </div>
        <div className="stat-card__footer">{children}</div>
      </Card.Body>
    </Card>
  );
}
