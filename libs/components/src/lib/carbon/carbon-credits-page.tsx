import './carbon-credits-page.scss';
import { Alert, Button } from 'react-bootstrap';
import { CarbonCreditsEmptyState } from './carbon-credits-empty-state';
import { CarbonCreditsStats } from './carbon-credits-stats';
import { CarbonCreditsTable } from './carbon-credits-table';
import { Link } from '@tanstack/react-router';
import { PageSpinner } from '../shared/page-spinner';
import { useCarbonOrders } from '@energy-broker/api-client';

export function CarbonCreditsPage() {
  const { data: summary, error, isLoading } = useCarbonOrders();

  if (isLoading) {
    return <PageSpinner />;
  }

  if (error) {
    return <Alert variant="danger">{(error as Error).message}</Alert>;
  }

  if (!summary || summary.orders.length === 0) {
    return <CarbonCreditsEmptyState />;
  }

  return (
    <div className="carbon-credits">
      <div className="carbon-credits__header">
        <h2 className="carbon-credits__title">Carbon Credits</h2>
        <Link to="/carbon-credits/offset">
          <Button variant="primary">Offset Carbon</Button>
        </Link>
      </div>
      <CarbonCreditsStats summary={summary} />
      <CarbonCreditsTable orders={summary.orders} />
    </div>
  );
}
