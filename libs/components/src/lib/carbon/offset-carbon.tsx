import './offset-carbon.scss';
import { Alert, Button, Card, Form } from 'react-bootstrap';
import { useCarbonProjects, useCreateCarbonOrder } from '@energy-broker/api-client';
import { GRAMS_PER_METRIC_TON } from '@energy-broker/shared';
import { Link } from '@tanstack/react-router';
import { OffsetProjectCards } from './offset-project-cards';
import { PageSpinner } from '../shared/page-spinner';
import { useState } from 'react';

export function OffsetCarbon() {
  const { data: projects = [], error, isLoading } = useCarbonProjects();
  const createOrder = useCreateCarbonOrder();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [massMetricTons, setMassMetricTons] = useState('1');

  const selectedProject = projects.find(p => p.id === selectedProjectId);
  const massGrams = Math.round(parseFloat(massMetricTons || '0') * GRAMS_PER_METRIC_TON);

  const handleCheckout = () => {
    if (!selectedProjectId || massGrams <= 0) return;

    createOrder.mutate(
      { massGrams, projectId: selectedProjectId },
      {
        onSuccess: (data) => {
          window.location.href = data.checkoutUrl;
        },
      },
    );
  };

  if (isLoading) {
    return <PageSpinner />;
  }

  if (error) {
    return <Alert variant="danger">{(error as Error).message}</Alert>;
  }

  return (
    <div>
      <Link className="offset-carbon__back" to="/carbon-credits">
        {'< Back to Carbon Credits'}
      </Link>

      <h2>Offset Carbon</h2>
      <p className="offset-carbon__subtitle">
        Select a project and choose how much carbon to offset.
      </p>

      <OffsetProjectCards
        onSelect={setSelectedProjectId}
        projects={projects}
        selectedId={selectedProjectId}
      />

      {selectedProject && (
        <Card className="offset-carbon__checkout">
          <Card.Body>
            <h5 className="offset-carbon__checkout-title">
              {'Offset with: '}
              {selectedProject.name}
            </h5>
            <Form.Group className="offset-carbon__amount-input">
              <Form.Label>Amount (metric tons CO2)</Form.Label>
              <Form.Control
                min="0.001"
                onChange={e => setMassMetricTons(e.target.value)}
                step="0.001"
                type="number"
                value={massMetricTons}
              />
            </Form.Group>
            <Button
              disabled={createOrder.isPending || massGrams <= 0}
              onClick={handleCheckout}
              variant="primary"
            >
              {createOrder.isPending ? 'Creating order...' : 'Proceed to Checkout'}
            </Button>
            {createOrder.isError && (
              <Alert className="mt-3" variant="danger">
                {(createOrder.error as Error).message}
              </Alert>
            )}
          </Card.Body>
        </Card>
      )}
    </div>
  );
}
