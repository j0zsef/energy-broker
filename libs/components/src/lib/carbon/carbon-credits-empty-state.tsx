import './carbon-credits-empty-state.scss';
import { Button, Card } from 'react-bootstrap';
import { Link } from '@tanstack/react-router';

const features = [
  { icon: '🌍', label: 'Browse verified offset projects' },
  { icon: '📦', label: 'Purchase carbon credits instantly' },
  { icon: '📈', label: 'Track your offset history over time' },
];

export function CarbonCreditsEmptyState() {
  return (
    <Card className="carbon-empty">
      <Card.Body className="carbon-empty__body">
        <div className="carbon-empty__icon-ring">🌿</div>
        <h3 className="carbon-empty__heading">No Carbon Credits Yet</h3>
        <p className="carbon-empty__description">
          Offset your carbon footprint by purchasing carbon credits from verified projects.
        </p>

        <div className="carbon-empty__features">
          {features.map(f => (
            <div className="carbon-empty__feature" key={f.label}>
              <span className="carbon-empty__feature-icon">{f.icon}</span>
              <span className="carbon-empty__feature-label">{f.label}</span>
            </div>
          ))}
        </div>

        <Link to="/carbon-credits/offset">
          <Button className="carbon-empty__cta" size="lg" variant="primary">Offset Carbon</Button>
        </Link>
      </Card.Body>
    </Card>
  );
}
