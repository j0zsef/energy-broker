import './carbon-credits-table.scss';
import { Badge, Table } from 'react-bootstrap';
import { CarbonOrderResponse, GRAMS_PER_METRIC_TON } from '@energy-broker/shared';

interface CarbonCreditsTableProps {
  orders: CarbonOrderResponse[]
}

export function CarbonCreditsTable({ orders }: CarbonCreditsTableProps) {
  if (orders.length === 0) {
    return <div className="carbon-table__empty">No orders found.</div>;
  }

  return (
    <div className="carbon-table">
      {/* Desktop: table layout */}
      <div className="carbon-table__desktop">
        <Table hover>
          <thead>
            <tr>
              <th>Credits</th>
              <th>Type</th>
              <th>Date Added</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td>
                  {(order.massGrams / GRAMS_PER_METRIC_TON).toFixed(4)}
                  {' MT'}
                </td>
                <td>
                  {order.projectType
                    ? <Badge bg="secondary">{order.projectType}</Badge>
                    : '—'}
                </td>
                <td>{new Date(order.createdAt).toLocaleDateString('en-US')}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {/* Mobile: card layout */}
      <div className="carbon-table__mobile">
        {orders.map(order => (
          <div className="carbon-table__card" key={order.id}>
            <div className="carbon-table__card-header">
              <span className="carbon-table__card-credits">
                {(order.massGrams / GRAMS_PER_METRIC_TON).toFixed(4)}
                {' MT'}
              </span>
              {order.projectType && <Badge bg="secondary">{order.projectType}</Badge>}
            </div>
            <div className="carbon-table__card-meta">
              <span>{new Date(order.createdAt).toLocaleDateString('en-US')}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
