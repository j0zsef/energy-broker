import './unauth-spotlight.scss';
import { Button, Card } from 'react-bootstrap';

interface SpotlightPill {
  label: string
  variant: string
}

interface UnauthenticatedSpotlightProps {
  ctaText: string
  description: string
  icon: string
  iconVariant: 'energy' | 'connections' | 'carbon'
  onLogin: () => void
  pills: SpotlightPill[]
  title: string
}

export function UnauthenticatedSpotlight({
  ctaText,
  description,
  icon,
  iconVariant,
  onLogin,
  pills,
  title,
}: UnauthenticatedSpotlightProps) {
  return (
    <Card className={`unauth-spotlight unauth-spotlight--${iconVariant}`}>
      <Card.Body className="unauth-spotlight__body">
        <div className={`unauth-spotlight__icon unauth-spotlight__icon--${iconVariant}`}>
          {icon}
        </div>
        <h3 className="unauth-spotlight__title">{title}</h3>
        <p className="unauth-spotlight__description">{description}</p>
        <div className="unauth-spotlight__pills">
          {pills.map(pill => (
            <span className={`unauth-spotlight__pill unauth-spotlight__pill--${pill.variant}`} key={pill.label}>
              {pill.label}
            </span>
          ))}
        </div>
        <Button className="unauth-spotlight__cta" onClick={onLogin} variant="primary">
          {ctaText}
        </Button>
      </Card.Body>
    </Card>
  );
}
