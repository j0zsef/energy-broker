import './energy-connections.scss';
import { Button, Table } from 'react-bootstrap';
import { apiClient, useDeleteConnection, useEnergyConnections } from '@energy-broker/api-client';
import { Link } from '@tanstack/react-router';
import { useCallback } from 'react';

export const EnergyConnections = () => {
  const { data: energyConnections, isLoading, error } = useEnergyConnections();
  const deleteConnection = useDeleteConnection();

  const isExpired = useCallback((expiresAt: Date | string) => {
    return new Date(expiresAt) < new Date();
  }, []);

  const handleRefresh = useCallback((energyProviderId: number) => {
    apiClient<{ url: string }>('v1/energy-providers/authorize', {
      body: JSON.stringify({ energyProviderId }),
      method: 'POST',
    })
      .then((data) => {
        window.location.href = data.url;
      })
      .catch((err) => {
        console.error('Failed to initiate provider OAuth:', err);
      });
  }, []);

  const handleDelete = useCallback((connectionId: number) => {
    if (window.confirm('Are you sure you want to delete this connection?')) {
      deleteConnection.mutate(connectionId);
    }
  }, [deleteConnection]);

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
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          { !energyConnections || energyConnections.length === 0
            ? (
                <tr>
                  <td className="text-center" colSpan={5}>No energy connections found.</td>
                </tr>
              )
            : (
                energyConnections.map((connection) => {
                  const expired = isExpired(connection.expiresAt);
                  return (
                    <tr className={expired ? 'table-warning' : ''} key={connection.id}>
                      <td>{connection.energyProvider.name || 'N/A'}</td>
                      <td>{connection.energyProvider.type}</td>
                      <td>{new Date(connection.createdAt).toLocaleDateString('en-US')}</td>
                      <td>
                        {expired
                          ? <span className="text-danger">Expired</span>
                          : <span className="text-success">Active</span>}
                      </td>
                      <td>
                        {expired && (
                          <Button
                            className="me-2"
                            onClick={() => handleRefresh(connection.energyProviderId)}
                            size="sm"
                            variant="outline-primary"
                          >
                            Refresh
                          </Button>
                        )}
                        <Button
                          disabled={deleteConnection.isPending}
                          onClick={() => handleDelete(connection.id)}
                          size="sm"
                          variant="outline-danger"
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
        </tbody>
      </Table>
    </div>
  );
};
