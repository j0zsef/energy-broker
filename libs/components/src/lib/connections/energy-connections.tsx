import './energy-connections.scss';
import { Button, Table } from 'react-bootstrap';
import { Link } from '@tanstack/react-router';
import { useState } from 'react';

interface EnergySource {
  name?: string
  // Add other properties as needed
}

export const EnergyConnections = () => {
  // TODO: Fetch EnergyProviderConnections by user

  const [energySources] = useState<EnergySource[]>([]);

  return (
    <div className="energy-connections">
      <div className="d-flex justify-content-between">
        <Link to="/connections/add">
          <Button>Add connection</Button>
        </Link>
      </div>

      <Table hover={true} responsive={true}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Date Added</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          { energySources.length === 0
            ? (
                <tr>
                  <td colSpan={4} className="text-center">No energy connections found.</td>
                </tr>
              )
            : (
                energySources.map((source, index) => (
                  <tr key={index}>
                    { /* link to dynamic energy connection route */ }
                    <td>{source.name || 'N/A'}</td>
                    <td>{/* Type */}</td>
                    <td>{/* Date Added */}</td>
                    <td>{/* Delete action */}</td>
                  </tr>
                ))
              )}
        </tbody>
      </Table>
    </div>
  );
};
