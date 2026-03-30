import { CarbonSuccess, PageSpinner } from '@energy-broker/components';
import { Link, createFileRoute, redirect } from '@tanstack/react-router';
import { useEffect, useRef } from 'react';
import { Alert } from 'react-bootstrap';
import { usePlaceCarbonOrder } from '@energy-broker/api-client';
import z from 'zod';

const searchSchema = z.object({
  orderId: z.string().optional(),
});

export const Route = createFileRoute('/carbon-credits/success')({
  beforeLoad: ({ context, location }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({
        search: { redirect: location.href },
        to: '/',
      });
    }
  },
  component: RouteComponent,
  validateSearch: searchSchema,
});

function RouteComponent() {
  const { orderId } = Route.useSearch();
  const placeOrder = usePlaceCarbonOrder();
  const placedRef = useRef(false);

  useEffect(() => {
    if (orderId && !placedRef.current) {
      placedRef.current = true;
      placeOrder.mutate(Number(orderId));
    }
  }, [orderId, placeOrder]);

  if (!orderId) {
    return (
      <Alert variant="warning">
        {'No order ID found. '}
        <Link to="/carbon-credits">Return to Carbon Credits</Link>
      </Alert>
    );
  }

  if (placeOrder.isPending) {
    return <PageSpinner label="Placing your order..." />;
  }

  if (placeOrder.isError) {
    return (
      <Alert variant="danger">
        {'Failed to place order: '}
        {(placeOrder.error as Error).message}
      </Alert>
    );
  }

  return <CarbonSuccess />;
}
