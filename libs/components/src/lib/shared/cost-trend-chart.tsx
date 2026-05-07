import './cost-trend-chart.scss';
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import { ParsedSummary, formatMonthLabel } from './use-energy-dashboard';
import { Card } from 'react-bootstrap';
import { Line } from 'react-chartjs-2';
import { useChartTheme } from './use-chart-theme';
import { useMemo } from 'react';

ChartJS.register(CategoryScale, Filler, Legend, LineElement, LinearScale, PointElement, Title, Tooltip);

const PROVIDER_PALETTE = [
  'rgba(13, 148, 136, 0.7)',
  'rgba(8, 145, 178, 0.7)',
  'rgba(22, 163, 74, 0.7)',
  'rgba(217, 119, 6, 0.7)',
  'rgba(71, 85, 105, 0.7)',
  'rgba(124, 58, 237, 0.7)',
];

interface MonthlyCostData {
  datasets: { color: string, data: number[], label: string }[]
  labels: string[]
}

interface CostTrendChartProps {
  filteredMeters: ParsedSummary[]
}

export function CostTrendChart({ filteredMeters }: CostTrendChartProps) {
  const { gridColor, textColor } = useChartTheme();

  const monthlyCost = useMemo<MonthlyCostData>(() => {
    const chronological = [...filteredMeters].sort((a, b) => a.date.getTime() - b.date.getTime());
    const monthLabels = [...new Set(chronological.map(e => formatMonthLabel(e.date)))];
    const providerLabels = [...new Set(chronological.map(e => e.connectionLabel))];

    return {
      datasets: providerLabels.map((provider, i) => {
        const providerEntries = chronological.filter(e => e.connectionLabel === provider);
        const data = monthLabels.map(month =>
          providerEntries
            .filter(e => formatMonthLabel(e.date) === month)
            .reduce((sum, e) => sum + e.costDollars, 0),
        );
        return {
          color: PROVIDER_PALETTE[i % PROVIDER_PALETTE.length],
          data,
          label: provider,
        };
      }),
      labels: monthLabels,
    };
  }, [filteredMeters]);

  if (monthlyCost.labels.length < 2) return null;

  const hasMultipleProviders = monthlyCost.datasets.length > 1;

  return (
    <Card className="cost-trend-card">
      <Card.Body>
        <div className="cost-trend-card__title">Cost Trend</div>
        <Line
          data={{
            datasets: monthlyCost.datasets.map(ds => ({
              backgroundColor: ds.color.replace('0.7', '0.1'),
              borderColor: ds.color.replace('0.7', '1'),
              borderWidth: 2.5,
              data: ds.data,
              fill: false,
              label: ds.label,
              pointBackgroundColor: ds.color.replace('0.7', '1'),
              pointRadius: 4,
              tension: 0.3,
            })),
            labels: monthlyCost.labels,
          }}
          options={{
            plugins: {
              legend: { display: hasMultipleProviders, labels: { color: textColor } },
              tooltip: {
                callbacks: {
                  label: (ctx) => {
                    const cost = (ctx.parsed.y as number).toFixed(2);
                    return ` ${ctx.dataset.label}: $${cost}`;
                  },
                },
              },
            },
            responsive: true,
            scales: {
              x: { grid: { color: gridColor }, ticks: { color: textColor } },
              y: {
                beginAtZero: true,
                grid: { color: gridColor },
                ticks: { callback: val => `$${val}`, color: textColor },
              },
            },
          }}
        />
      </Card.Body>
    </Card>
  );
}
