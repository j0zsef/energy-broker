import './energy-chart-card.scss';
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js';
import React, { useCallback, useRef } from 'react';
import { Card } from 'react-bootstrap';
import { Doughnut } from 'react-chartjs-2';
import { EnergyMixEntry } from './use-energy-dashboard';
import { useChartTheme } from './use-chart-theme';

ChartJS.register(ArcElement, Legend, Tooltip);

const PALETTE = [
  'rgba(13, 148, 136, 0.7)',
  'rgba(8, 145, 178, 0.7)',
  'rgba(22, 163, 74, 0.7)',
  'rgba(217, 119, 6, 0.7)',
  'rgba(71, 85, 105, 0.7)',
  'rgba(124, 58, 237, 0.7)',
];

interface EnergyBreakdownProps {
  energyMix: EnergyMixEntry[]
  onSegmentClick?: (index: number) => void
}

export function EnergyBreakdown({ energyMix, onSegmentClick }: EnergyBreakdownProps) {
  const chartRef = useRef<ChartJS<'doughnut'>>(null);
  const { textColor } = useChartTheme();

  const handleClick = useCallback(
    (_event: React.MouseEvent<HTMLCanvasElement>) => {
      if (!onSegmentClick || !chartRef.current) return;
      const elements = chartRef.current.getElementsAtEventForMode(
        _event.nativeEvent, 'nearest', { intersect: true }, false,
      );
      if (elements.length > 0) {
        onSegmentClick(elements[0].index);
      }
    },
    [onSegmentClick],
  );

  if (!energyMix.length) {
    return (
      <Card className="energy-chart-card">
        <Card.Body className="d-flex align-items-center justify-content-center">
          <p className="text-body-secondary mb-0">No breakdown data available.</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="energy-chart-card">
      <Card.Body className="d-flex flex-column align-items-center justify-content-center">
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
          onClick={handleClick}
          options={{
            onHover: onSegmentClick
              ? (event, elements) => {
                  const canvas = event.native?.target as HTMLCanvasElement | undefined;
                  if (canvas) {
                    canvas.style.cursor = elements.length > 0 ? 'pointer' : 'default';
                  }
                }
              : undefined,
            plugins: {
              legend: { labels: { color: textColor }, position: 'bottom' },
              title: { color: textColor, display: true, text: 'Energy Breakdown' },
              tooltip: {
                callbacks: {
                  label: (ctx) => {
                    const entry = energyMix[ctx.dataIndex];
                    const kwh = ctx.parsed.toLocaleString();
                    const cost = entry?.costDollars
                      ? ` · $${entry.costDollars.toFixed(2)}`
                      : '';
                    return ` ${ctx.label}: ${kwh} kWh${cost}`;
                  },
                },
              },
            },
            responsive: true,
          }}
          ref={chartRef}
        />
      </Card.Body>
    </Card>
  );
}
