import { Button } from 'react-bootstrap';
import { Overview } from '@energy-broker/components';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: Index,
});

export function Index() {
  const { auth } = Route.useRouteContext();

  return (
    <>
      <h2>Energy Overview</h2>
      { /* future marketing page if not auth */ }
      { !auth.isAuthenticated
        ? (
            <div className="d-flex flex-column gap-2">
              <span>Login to view your energy data: </span>
              <Button className="align-self-start" onClick={() => auth.login()}>Login</Button>
            </div>
          )
        : <Overview />}
    </>
  )
  ;
}

export default Index;
