import './energy-overview.scss';
import { Card, Col, Row } from 'react-bootstrap';
import { DashboardStats } from './use-energy-dashboard';

interface StatsCardsProps {
  stats: DashboardStats
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <Row className="mb-4 g-3">
      <Col md={4}>
        <Card className="stat-card text-center">
          <Card.Body>
            <Card.Subtitle className="mb-2 text-muted">Total Cost</Card.Subtitle>
            <Card.Title className="stat-value">
              $
              {stats.totalCostDollars.toFixed(2)}
            </Card.Title>
          </Card.Body>
        </Card>
      </Col>
      <Col md={4}>
        <Card className="stat-card text-center">
          <Card.Body>
            <Card.Subtitle className="mb-2 text-muted">Consumption</Card.Subtitle>
            <Card.Title className="stat-value">
              {stats.totalConsumptionKwh.toFixed(1)}
              {' kWh'}
            </Card.Title>
          </Card.Body>
        </Card>
      </Col>
      <Col md={4}>
        <Card className="stat-card text-center">
          <Card.Body>
            <Card.Subtitle className="mb-2 text-muted">Carbon Footprint</Card.Subtitle>
            <Card.Title className="stat-value">
              {stats.carbonFootprintLbs.toFixed(1)}
              {' lbs CO2'}
            </Card.Title>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
}
