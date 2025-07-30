import { Col, Row } from 'react-bootstrap';
import { EnergyOverview } from './energy-overview';

export function Overview() {
  // Energy Overview component
  // Energy Breakdown component
  return (
    <>
      <Row className="mb-3">
        <Col>
          <h2>Energy Overview</h2>
          <EnergyOverview />
        </Col>
      </Row>
      <hr className="divider" />
      <Row>
        <Col>
          {/* <EnergyBreakdown /> */}
        </Col>
      </Row>
    </>
  );
}
