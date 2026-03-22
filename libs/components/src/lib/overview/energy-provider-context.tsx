import './energy-provider-context.scss';
import { Badge } from 'react-bootstrap';
import { EnergyProviderConnectionResponse } from '@energy-broker/shared';
import { Link } from '@tanstack/react-router';

interface EnergyProviderContextProps {
  connections: EnergyProviderConnectionResponse[]
}

export function EnergyProviderContext({ connections }: EnergyProviderContextProps) {
  if (!connections.length) return null;

  return (
    <div className="provider-strip mb-3">
      <small className="text-body-secondary me-1">Data from:</small>
      {connections.map(conn => (
        <Link
          key={conn.id}
          params={{ 'energy-connection': String(conn.id) }}
          to="/connections/$energy-connection"
        >
          <Badge bg="secondary" className="text-decoration-none">
            {conn.energyProvider.name}
            <span className="ms-1 opacity-75">{conn.energyProvider.type}</span>
          </Badge>
        </Link>
      ))}
    </div>
  );
}
