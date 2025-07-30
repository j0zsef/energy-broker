import { Link } from '@tanstack/react-router';

export function EnergySources() {
  return (
    <>
      <h2>Energy Sources</h2>
      <Link to="/sources/add">+ Add an energy Source</Link>
      <div>
        <p>List of energy sources will be displayed here.</p>
        {/* Placeholder for future energy sources list */}
      </div>
    </>
  );
}
