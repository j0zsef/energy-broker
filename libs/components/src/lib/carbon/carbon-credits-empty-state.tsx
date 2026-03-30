import './carbon-credits-empty-state.scss';
import { Button, Card } from 'react-bootstrap';
import { Link } from '@tanstack/react-router';

export function CarbonCreditsEmptyState() {
  return (
    <Card className="carbon-empty">
      <Card.Body>
        <h3 className="carbon-empty__title">No Carbon Credits Yet</h3>
        <p className="carbon-empty__description">
          Offset your carbon footprint by purchasing carbon credits from verified projects.
        </p>
        <Link to="/carbon-credits/offset">
          <Button size="lg" variant="primary">Offset Carbon</Button>
        </Link>
      </Card.Body>
    </Card>
  );
}
