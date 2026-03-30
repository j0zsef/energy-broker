import './carbon-success.scss';
import { Button, Card } from 'react-bootstrap';
import { Link } from '@tanstack/react-router';

export function CarbonSuccess() {
  return (
    <Card className="carbon-success">
      <Card.Body>
        <h3 className="carbon-success__title">Order Confirmed</h3>
        <p className="carbon-success__description">
          Your carbon offset order has been placed successfully.
        </p>
        <Link to="/carbon-credits">
          <Button variant="primary">View Carbon Credits</Button>
        </Link>
      </Card.Body>
    </Card>
  );
}
