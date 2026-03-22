import './energy-empty-state.scss';
import { Button, Card } from 'react-bootstrap';
import { Link } from '@tanstack/react-router';

export function EnergyEmptyState() {
  return (
    <Card className="text-center py-4">
      <Card.Body>
        <h3 className="fw-bold mb-3">Welcome to Energy Broker</h3>
        <p className="text-body-secondary mb-4">
          Connect your utility account to start tracking usage, costs, and your carbon footprint.
        </p>
        <div className="d-flex flex-column align-items-center gap-3 mb-4">
          <div className="onboarding-step">
            <span className="onboarding-step__number">1</span>
            <span>Connect an energy provider</span>
          </div>
          <div className="onboarding-step">
            <span className="onboarding-step__number">2</span>
            <span>View your usage and costs</span>
          </div>
          <div className="onboarding-step">
            <span className="onboarding-step__number">3</span>
            <span>Save money and offset carbon</span>
          </div>
        </div>
        <Link to="/connections/add">
          <Button size="lg" variant="primary">Add energy connection</Button>
        </Link>
      </Card.Body>
    </Card>
  );
}
