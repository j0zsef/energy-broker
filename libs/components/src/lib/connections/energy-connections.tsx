import './energy-connections.scss';
import { Badge, Button, Table } from 'react-bootstrap';
import { apiClient, useDeleteConnection, useEnergyConnections } from '@energy-broker/api-client';
import { Link } from '@tanstack/react-router';
import { useCallback } from 'react';

export const EnergyConnections = () => {
  const { data: energyConnections, error, isLoading } = useEnergyConnections();
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

  const empty = !energyConnections || energyConnections.length === 0;

  return (
    <div className="energy-connections">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <Link to="/connections/add">
          <Button variant="primary">Add connection</Button>
        </Link>
      </div>

      {isLoading && <p>Loading energy connections...</p>}
      {error && (
        <p className="text-danger">
          {'Error loading energy connections: '}
          {(error as Error).message}
        </p>
      )}

      {/* Desktop: table layout */}
      <div className="energy-connections__table">
        <Table hover={true}>
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
            {empty
              ? (
                  <tr>
                    <td className="text-center" colSpan={5}>No energy connections found.</td>
                  </tr>
                )
              : (
                  energyConnections.map((connection) => {
                    const expired = isExpired(connection.expiresAt);
                    return (
                      <tr className={expired ? 'energy-connections__row--expired' : ''} key={connection.id}>
                        <td>{connection.energyProvider.name || 'N/A'}</td>
                        <td>{connection.energyProvider.type}</td>
                        <td>{new Date(connection.createdAt).toLocaleDateString('en-US')}</td>
                        <td>
                          {expired
                            ? <Badge bg="danger">Expired</Badge>
                            : <Badge bg="success">Active</Badge>}
                        </td>
                        <td className="text-nowrap">
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

      {/* Mobile: card layout */}
      <div className="energy-connections__cards">
        {empty
          ? <p className="text-center text-body-secondary">No energy connections found.</p>
          : (
              energyConnections.map((connection) => {
                const expired = isExpired(connection.expiresAt);
                return (
                  <div
                    className={`energy-connections__card${expired ? ' energy-connections__card--expired' : ''}`}
                    key={connection.id}
                  >
                    <div className="energy-connections__card-header">
                      <span className="energy-connections__card-name">
                        {connection.energyProvider.name || 'N/A'}
                      </span>
                      {expired
                        ? <Badge bg="danger">Expired</Badge>
                        : <Badge bg="success">Active</Badge>}
                    </div>
                    <div className="energy-connections__card-meta">
                      <span>{connection.energyProvider.type}</span>
                      <span>{new Date(connection.createdAt).toLocaleDateString('en-US')}</span>
                    </div>
                    <div className="energy-connections__card-actions">
                      {expired && (
                        <Button
                          onClick={() => handleRefresh(connection.energyProviderId)}
                          size="sm"
                          variant="primary"
                        >
                          Refresh
                        </Button>
                      )}
                      <Button
                        disabled={deleteConnection.isPending}
                        onClick={() => handleDelete(connection.id)}
                        size="sm"
                        variant="danger"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
      </div>
    </div>
  );
};
