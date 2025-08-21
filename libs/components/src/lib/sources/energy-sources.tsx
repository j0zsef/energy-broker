import { Col, Row } from 'react-bootstrap';
import { Link, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

interface EnergySource {
  name?: string
  // Add other properties as needed
}

export function EnergySources() {
  const [energySources, setEnergySources] = useState<EnergySource[]>([]);
  const navigate = useNavigate();

  // Fetch energy sources (replace with your API)
  useEffect(() => {
    fetch('/api/energy-sources')
      .then(res => res.json())
      .then((data: EnergySource[]) => setEnergySources(data))
      .catch(() => setEnergySources([]));
  }, []);

  // Handle OAuth redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (code) {
      fetch('http://localhost:3001/token', {
        body: JSON.stringify({ code }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      })
        .then(res => res.json())
        .then(async ({ access_token }) => {
          const dataRes = await fetch('/api/provider-data', {
            headers: { Authorization: `Bearer ${access_token}` },
          });
          const providerData: EnergySource = await dataRes.json();

          await fetch('/api/energy-sources', {
            body: JSON.stringify({ ...providerData }),
            headers: { 'Content-Type': 'application/json' },
            method: 'POST',
          });

          setEnergySources(prev => [...prev, providerData]);
          navigate({ to: '/sources' });
        })
        .catch(() => {});
    }
  }, [navigate]);

  return (
    <>
      <Row className="mb-3">
        <Col>
          <h2>Energy Sources</h2>
          <Link to="/sources/add" className="ms-3">+ Add manually</Link>
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
    </>
  );
}
