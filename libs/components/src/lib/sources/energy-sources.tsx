import { Col, Row } from 'react-bootstrap';
import { Link } from '@tanstack/react-router';

export function EnergySources() {
  return (
    <>
      <Row className="mb-3">
        <Col>
          <h2>Energy Sources</h2>
          <Link to="/sources/add">+ Add an energy Source</Link>
        </Col>
      </Row>
      <Row>
        <Col>
          <div>
            <p>List of energy sources will be displayed here.</p>
            {/* Placeholder for future energy sources list */}
          </div>
        </Col>
      </Row>
    </>
  );
}
