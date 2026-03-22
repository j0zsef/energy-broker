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
import { Bar } from 'react-chartjs-2';
import { Card } from 'react-bootstrap';
import { MonthlyConsumption } from './use-energy-dashboard';
import { useChartTheme } from './use-chart-theme';

ChartJS.register(BarElement, CategoryScale, Legend, LinearScale, Title, Tooltip);

interface EnergyConsumptionChartProps {
  monthlyConsumption: MonthlyConsumption
}

export function EnergyConsumptionChart({ monthlyConsumption }: EnergyConsumptionChartProps) {
  const hasMultipleMonths = monthlyConsumption.data.length > 1;
  const { gridColor, textColor } = useChartTheme();

  return (
    <Card className="energy-chart-card">
      <Card.Body>
        {hasMultipleMonths
          ? (
              <Bar
                data={{
                  datasets: [
                    {
                      backgroundColor: 'rgba(13, 148, 136, 0.7)',
                      borderColor: 'rgba(13, 148, 136, 1)',
                      borderWidth: 1,
                      data: monthlyConsumption.data,
                      label: 'Consumption (kWh)',
                    },
                  ],
                  labels: monthlyConsumption.labels,
                }}
                options={{
                  plugins: {
                    legend: { display: false },
                    title: { color: textColor, display: true, text: 'Monthly Consumption' },
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
            )
          : (
              <div className="d-flex flex-column align-items-center justify-content-center text-center py-4">
                <h6 className="text-body-secondary mb-1">Monthly Consumption</h6>
                <span className="display-5 fw-bold">
                  {monthlyConsumption.data[0]?.toLocaleString() ?? '—'}
                </span>
                <span className="text-body-secondary">kWh</span>
                {monthlyConsumption.labels[0] && (
                  <small className="text-body-secondary mt-2">
                    {monthlyConsumption.labels[0]}
                  </small>
                )}
              </div>
            )}
      </Card.Body>
    </Card>
  );
}
