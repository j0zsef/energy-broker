import { Col, Row } from 'react-bootstrap';
import { DashboardStats } from './use-energy-dashboard';
import { DeltaBadge } from '../shared/delta-badge';
import { StatCard } from '../shared/stat-card';

interface EnergyStatsCardsProps {
  stats: DashboardStats
}

export function EnergyStatsCards({ stats }: EnergyStatsCardsProps) {
  return (
    <Row className="mb-4 g-3">
      <Col md={4}>
        <StatCard subtitle="Total Cost" value={`$${stats.totalCostDollars.toFixed(2)}`}>
          <DeltaBadge value={stats.deltas.costPct} />
        </StatCard>
      </Col>
      <Col md={4}>
        <StatCard subtitle="Consumption" unit="kWh" value={stats.totalConsumptionKwh.toFixed(1)}>
          <DeltaBadge value={stats.deltas.consumptionPct} />
        </StatCard>
      </Col>
      <Col md={4}>
        <StatCard subtitle="Carbon Footprint" unit="MT CO2" value={stats.emissionsMtCo2.toFixed(4)} variant="success">
          <DeltaBadge value={stats.deltas.carbonPct} />
        </StatCard>
      </Col>
    </Row>
  );
}
