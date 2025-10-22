import './energy-connections.scss';
import { Button, Table } from 'react-bootstrap';
import { Link } from '@tanstack/react-router';
import { useEnergyConnections } from '@energy-broker/api-client';

export const EnergyConnections = () => {
  const { data: energyConnections, isLoading, error } = useEnergyConnections();

  return (
    <div className="energy-connections">
      <div className="d-flex justify-content-between">
        <Link to="/connections/add">
          <Button>Add connection</Button>
        </Link>
      </div>

      { isLoading && <p>Loading energy connections...</p> }
      { error && (
        <p className="text-danger">
          Error loading energy connections:
          {(error as Error).message}
        </p>
      ) }

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
          { !energyConnections || energyConnections.length === 0
            ? (
                <tr>
                  <td colSpan={4} className="text-center">No energy connections found.</td>
                </tr>
              )
            : (
                energyConnections.map((connection, index) => (
                  <tr key={index}>
                    { /* link to dynamic energy connection route */ }
                    <td>{connection.energyProvider.name || 'N/A'}</td>
                    <td>{connection.energyProvider.type}</td>
                    <td>{connection.createdAt.toLocaleDateString('en_US')}</td>
                    <td>{/* Delete action */}</td>
                  </tr>
                ))
              )}
        </tbody>
      </Table>
    </div>
  );
};
