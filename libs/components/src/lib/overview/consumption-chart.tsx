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
import { MonthlyConsumption } from './use-energy-dashboard';

ChartJS.register(BarElement, CategoryScale, Legend, LinearScale, Title, Tooltip);

interface ConsumptionChartProps {
  monthlyConsumption: MonthlyConsumption
}

export function ConsumptionChart({ monthlyConsumption }: ConsumptionChartProps) {
  return (
    <Bar
      data={{
        datasets: [
          {
            backgroundColor: 'rgba(54, 162, 235, 0.7)',
            borderColor: 'rgba(54, 162, 235, 1)',
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
          title: { display: true, text: 'Monthly Consumption' },
        },
        responsive: true,
        scales: {
          y: { beginAtZero: true, title: { display: true, text: 'kWh' } },
        },
      }}
    />
  );
}
