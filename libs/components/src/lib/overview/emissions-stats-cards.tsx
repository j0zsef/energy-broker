import './emissions-stats-cards.scss';
import { Col, Row } from 'react-bootstrap';
import { StatCard } from '../shared/stat-card';

interface EmissionsStatsCardsProps {
  creditsUsedMtCo2: number
  emissionsMtCo2: number
}

export function EmissionsStatsCards({ creditsUsedMtCo2, emissionsMtCo2 }: EmissionsStatsCardsProps) {
  const netEmissions = emissionsMtCo2 - creditsUsedMtCo2;

  return (
    <Row className="emissions-stats g-3">
      <Col md={4}>
        <StatCard subtitle="Emissions" unit="MT" value={emissionsMtCo2.toFixed(4)} />
      </Col>
      <Col md={4}>
        <StatCard subtitle="Credits Used" unit="MT" value={creditsUsedMtCo2.toFixed(4)} variant="success" />
      </Col>
      <Col md={4}>
        <StatCard
          subtitle="Net Emissions"
          unit="MT"
          value={netEmissions.toFixed(4)}
          variant={netEmissions <= 0 ? 'net-positive' : 'default'}
        />
      </Col>
    </Row>
  );
}
