import './energy-connections.scss';
import { Col, Row } from 'react-bootstrap';
import { Link } from '@tanstack/react-router';
import { useState } from 'react';

interface EnergySource {
  name?: string
  // Add other properties as needed
}

export const EnergyConnections = () => {
  // TODO: Fetch EnergyProviderConnections

  const [energySources] = useState<EnergySource[]>([]);

  return (
    <div className="energy-connections">
      <Row className="mb-3">
        <Col>
          <h2>Energy Connections</h2>
          <Link to="/connections/add" className="ms-3">+ Add manually</Link>
        </Col>
      </Row>
      <Row>
        <Col>
          <div>
            <p>List of energy sources:</p>
            <ul>
              {energySources.map((src, idx) => (
                <li key={idx}>{src.name || 'Unnamed Source'}</li>
              ))}
            </ul>
          </div>
        </Col>
      </Row>
    </div>
  );
};
