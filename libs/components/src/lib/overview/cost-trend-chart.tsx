import './cost-trend-chart.scss';
import { Bar, Line } from 'react-chartjs-2';
import {
  BarElement,
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
import { MonthlyCostData, ProviderDetail } from './use-energy-dashboard';
import { Card } from 'react-bootstrap';
import { useChartTheme } from './use-chart-theme';

ChartJS.register(BarElement, CategoryScale, Filler, Legend, LineElement, LinearScale, PointElement, Title, Tooltip);

interface CostTrendChartProps {
  monthlyCost: MonthlyCostData
  providerDetails: ProviderDetail[]
}

export function CostTrendChart({ monthlyCost, providerDetails }: CostTrendChartProps) {
  const hasMultipleMonths = monthlyCost.labels.length > 1;
  const hasMultipleProviders = monthlyCost.datasets.length > 1;
  const { gridColor, textColor } = useChartTheme();

  // Single month: bar per provider
  if (!hasMultipleMonths) {
    return (
      <Card className="cost-trend-card">
        <Card.Body>
          <div className="cost-trend-card__title">Cost by Provider</div>
          <Bar
            data={{
              datasets: [{
                backgroundColor: providerDetails.map((_, i) =>
                  monthlyCost.datasets[i]?.color ?? 'rgba(13,148,136,0.7)',
                ),
                borderColor: providerDetails.map((_, i) =>
                  (monthlyCost.datasets[i]?.color ?? 'rgba(13,148,136,0.7)').replace('0.7', '1'),
                ),
                borderWidth: 1,
                data: providerDetails.map(p => p.costDollars),
                label: 'Cost ($)',
              }],
              labels: providerDetails.map(p => p.label),
            }}
            options={{
              plugins: {
                legend: { display: false },
                tooltip: {
                  callbacks: {
                    label: (ctx) => {
                      const provider = providerDetails[ctx.dataIndex];
                      const cost = (ctx.parsed.y as number).toFixed(2);
                      return ` $${cost} · ${provider?.kWh.toLocaleString(undefined, { maximumFractionDigits: 1 })} kWh`;
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

  // Multiple months: line chart
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
