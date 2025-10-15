import { EnergyOverview } from './energy-overview';

export function Overview() {
  // Energy Overview component
  // Energy Breakdown component
  return (
    <>
      <h2>Energy Overview</h2>
      <EnergyOverview />
      <hr className="divider" />
      <h2>Energy Breakdown</h2>
      {/* <EnergyBreakdown /> */}
    </>
  );
}
