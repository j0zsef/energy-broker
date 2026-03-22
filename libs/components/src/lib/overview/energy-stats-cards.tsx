import './energy-stats-cards.scss';
import { Card, Col, Row } from 'react-bootstrap';
import { DashboardStats } from './use-energy-dashboard';
import { DeltaBadge } from '../shared/delta-badge';

interface EnergyStatsCardsProps {
  stats: DashboardStats
}

export function EnergyStatsCards({ stats }: EnergyStatsCardsProps) {
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
            <DeltaBadge value={stats.deltas.costPct} />
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
            <DeltaBadge value={stats.deltas.consumptionPct} />
          </Card.Body>
        </Card>
      </Col>
      <Col md={4}>
        <Card className="stat-card stat-card--carbon text-center">
          <Card.Body>
            <Card.Subtitle className="mb-2 text-muted">Carbon Footprint</Card.Subtitle>
            <Card.Title className="stat-value">
              {stats.carbonFootprintLbs.toFixed(1)}
              {' lbs CO2'}
            </Card.Title>
            <DeltaBadge value={stats.deltas.carbonPct} />
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
}
