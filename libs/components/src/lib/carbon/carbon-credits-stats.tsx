import './carbon-credits-stats.scss';
import { Col, Row } from 'react-bootstrap';
import { CarbonOrdersSummary } from '@energy-broker/shared';
import { StatCard } from '../shared/stat-card';

interface CarbonCreditsStatsProps {
  summary: CarbonOrdersSummary
}

export function CarbonCreditsStats({ summary }: CarbonCreditsStatsProps) {
  return (
    <Row className="carbon-stats g-3">
      <Col md={6}>
        <StatCard
          subtitle="Credits Used"
          unit="metric tons"
          value={summary.totalOffsetMtCo2.toFixed(2)}
          variant="success"
        />
      </Col>
      <Col md={6}>
        <StatCard
          subtitle="Amount Spent"
          value={`$${(summary.totalSpentCents / 100).toFixed(2)}`}
        />
      </Col>
    </Row>
  );
}
