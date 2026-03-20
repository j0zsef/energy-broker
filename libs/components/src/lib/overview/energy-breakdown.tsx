import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { EnergyMixEntry } from './use-energy-dashboard';

ChartJS.register(ArcElement, Legend, Tooltip);

const PALETTE = [
  'rgba(255, 99, 132, 0.7)',
  'rgba(54, 162, 235, 0.7)',
  'rgba(255, 206, 86, 0.7)',
  'rgba(75, 192, 192, 0.7)',
  'rgba(153, 102, 255, 0.7)',
  'rgba(255, 159, 64, 0.7)',
];

interface EnergyBreakdownProps {
  energyMix: EnergyMixEntry[]
}

export function EnergyBreakdown({ energyMix }: EnergyBreakdownProps) {
  if (!energyMix.length) {
    return <p className="text-muted">No breakdown data available.</p>;
  }

  return (
    <Doughnut
      data={{
        datasets: [
          {
            backgroundColor: PALETTE.slice(0, energyMix.length),
            data: energyMix.map(e => e.kWh),
          },
        ],
        labels: energyMix.map(e => e.label),
      }}
      options={{
        plugins: {
          legend: { position: 'bottom' },
          title: { display: true, text: 'Energy Breakdown' },
        },
        responsive: true,
      }}
    />
  );
}
