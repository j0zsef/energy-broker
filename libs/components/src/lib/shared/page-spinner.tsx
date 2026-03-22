import { Spinner } from 'react-bootstrap';

interface PageSpinnerProps {
  label?: string
}

export function PageSpinner({ label = 'Loading...' }: PageSpinnerProps) {
  return (
    <div className="d-flex justify-content-center py-5">
      <Spinner animation="border" className="text-primary" role="status">
        <span className="visually-hidden">{label}</span>
      </Spinner>
    </div>
  );
}
