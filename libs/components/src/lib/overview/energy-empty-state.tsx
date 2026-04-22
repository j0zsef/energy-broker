import './energy-empty-state.scss';
import { Button, Card } from 'react-bootstrap';
import { Link } from '@tanstack/react-router';

const steps = [
  { icon: '🔌', label: 'Connect an energy provider' },
  { icon: '📊', label: 'View your usage and costs' },
  { icon: '🌱', label: 'Save money and offset carbon' },
];

export function EnergyEmptyState() {
  return (
    <Card className="empty-state">
      <Card.Body className="empty-state__body">
        <div className="empty-state__icon-ring">⚡</div>
        <h3 className="empty-state__heading">Welcome to Energy Broker</h3>
        <p className="empty-state__subheading">
          Connect your utility account to start tracking usage, costs, and your carbon footprint.
        </p>

        <div className="empty-state__steps">
          {steps.map((step, i) => (
            <div className="empty-state__step" key={step.label}>
              <span className="empty-state__step-number">{i + 1}</span>
              <span className="empty-state__step-icon">{step.icon}</span>
              <span className="empty-state__step-label">{step.label}</span>
            </div>
          ))}
          <div className="empty-state__step-connector" />
        </div>

        <Link to="/connections/add">
          <Button className="empty-state__cta" size="lg" variant="primary">
            Add energy connection
          </Button>
        </Link>
      </Card.Body>
    </Card>
  );
}
