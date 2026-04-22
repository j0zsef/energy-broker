import './energy-chart-card.scss';
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from 'chart.js';
import { EnergyMixEntry, MonthlyConsumption, MonthlyProviderConsumption } from './use-energy-dashboard';
import { Bar } from 'react-chartjs-2';
import { Card } from 'react-bootstrap';
import { useChartTheme } from './use-chart-theme';

ChartJS.register(BarElement, CategoryScale, Legend, LinearScale, Title, Tooltip);

const PROVIDER_PALETTE = [
  'rgba(13, 148, 136, 0.7)',
  'rgba(8, 145, 178, 0.7)',
  'rgba(22, 163, 74, 0.7)',
  'rgba(217, 119, 6, 0.7)',
  'rgba(71, 85, 105, 0.7)',
  'rgba(124, 58, 237, 0.7)',
];

interface EnergyConsumptionChartProps {
  energyMix: EnergyMixEntry[]
  monthlyByProvider: MonthlyProviderConsumption
  monthlyConsumption: MonthlyConsumption
}

export function EnergyConsumptionChart({ energyMix, monthlyByProvider, monthlyConsumption }: EnergyConsumptionChartProps) {
  const hasMultipleMonths = monthlyConsumption.data.length > 1;
  const hasMultipleProviders = monthlyByProvider.datasets.length > 1;
  const { gridColor, textColor } = useChartTheme();

  // Single month: bar per provider
  if (!hasMultipleMonths) {
    const monthLabel = monthlyConsumption.labels[0] ?? 'This Month';

    return (
      <Card className="energy-chart-card">
        <Card.Body>
          <Bar
            data={{
              datasets: [{
                backgroundColor: energyMix.map((_, i) => PROVIDER_PALETTE[i % PROVIDER_PALETTE.length]),
                borderColor: energyMix.map((_, i) => PROVIDER_PALETTE[i % PROVIDER_PALETTE.length].replace('0.7', '1')),
                borderWidth: 1,
                data: energyMix.map(e => e.kWh),
                label: 'Consumption (kWh)',
              }],
              labels: energyMix.map(e => e.label),
            }}
            options={{
              plugins: {
                legend: { display: false },
                title: { color: textColor, display: true, text: `${monthLabel} — Consumption by Provider` },
                tooltip: {
                  callbacks: {
                    label: (ctx) => {
                      const entry = energyMix[ctx.dataIndex];
                      const kwh = (ctx.parsed.y as number).toLocaleString(undefined, { maximumFractionDigits: 1 });
                      return ` ${kwh} kWh · $${entry?.costDollars.toFixed(2)}`;
                    },
                  },
                },
              },
              responsive: true,
              scales: {
                x: {
                  grid: { color: gridColor },
                  ticks: { color: textColor },
                },
                y: {
                  beginAtZero: true,
                  grid: { color: gridColor },
                  ticks: { color: textColor },
                  title: { color: textColor, display: true, text: 'kWh' },
                },
              },
            }}
          />
        </Card.Body>
      </Card>
    );
  }

  // Multiple months: bar per month, stacked by provider if applicable
  return (
    <Card className="energy-chart-card">
      <Card.Body>
        <Bar
          data={{
            datasets: hasMultipleProviders
              ? monthlyByProvider.datasets.map(ds => ({
                  backgroundColor: ds.color,
                  borderColor: ds.color.replace('0.7', '1'),
                  borderWidth: 1,
                  data: ds.data,
                  label: ds.label,
                }))
              : [
                  {
                    backgroundColor: PROVIDER_PALETTE[0],
                    borderColor: PROVIDER_PALETTE[0].replace('0.7', '1'),
                    borderWidth: 1,
                    data: monthlyConsumption.data,
                    label: 'Consumption (kWh)',
                  },
                ],
            labels: monthlyConsumption.labels,
          }}
          options={{
            plugins: {
              legend: { display: hasMultipleProviders, labels: { color: textColor } },
              title: { color: textColor, display: true, text: 'Monthly Consumption' },
              tooltip: {
                callbacks: {
                  afterBody: (items) => {
                    if (!hasMultipleProviders) {
                      const monthIdx = items[0].dataIndex;
                      const totalCost = monthlyByProvider.datasets.reduce(
                        (sum, ds) => sum + (ds.costDollars[monthIdx] ?? 0), 0,
                      );
                      return `Cost: $${totalCost.toFixed(2)}`;
                    }
                    return '';
                  },
                  label: (ctx) => {
                    const yVal = ctx.parsed.y as number;
                    const kwh = yVal.toLocaleString(undefined, { maximumFractionDigits: 1 });
                    if (hasMultipleProviders) {
                      const ds = monthlyByProvider.datasets[ctx.datasetIndex];
                      const cost = ds?.costDollars[ctx.dataIndex] ?? 0;
                      return ` ${ctx.dataset.label}: ${kwh} kWh ($${cost.toFixed(2)})`;
                    }
                    return ` ${kwh} kWh`;
                  },
                },
              },
            },
            responsive: true,
            scales: {
              x: {
                grid: { color: gridColor },
                stacked: hasMultipleProviders,
                ticks: { color: textColor },
              },
              y: {
                beginAtZero: true,
                grid: { color: gridColor },
                stacked: hasMultipleProviders,
                ticks: { color: textColor },
                title: { color: textColor, display: true, text: 'kWh' },
              },
            },
          }}
        />
      </Card.Body>
    </Card>
  );
}
