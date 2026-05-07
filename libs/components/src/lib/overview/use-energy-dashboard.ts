import {
  CARBON_LBS_PER_KWH,
  DashboardStats,
  GreenButtonSummary,
  LBS_TO_METRIC_TONS,
  MeterDetail,
  MonthlyConsumption,
  MonthlyCostData,
  MonthlyProviderConsumption,
  PERIOD_MONTHS,
  ParsedSummary,
  ProviderDetail,
  StatDeltas,
  TimePeriod,
} from '@energy-broker/shared';
import { parseGreenButtonSummary } from './parse-green-button-summary';
import { useMemo } from 'react';

export type { DashboardStats, MonthlyConsumption, MonthlyCostData, MonthlyProviderConsumption, ParsedSummary, ProviderDetail, StatDeltas, TimePeriod };

function formatMonthLabel(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}

export function filterByPeriod(entries: ParsedSummary[], period: TimePeriod): ParsedSummary[] {
  const sorted = [...entries].sort((a, b) => b.date.getTime() - a.date.getTime());
  const monthCount = PERIOD_MONTHS[period];
  const distinctMonths = [...new Set(sorted.map(e => formatMonthLabel(e.date)))];
  const allowedMonths = new Set(distinctMonths.slice(0, monthCount));
  return sorted.filter(e => allowedMonths.has(formatMonthLabel(e.date)));
}

export function filterPreviousPeriod(entries: ParsedSummary[], period: TimePeriod): ParsedSummary[] {
  const sorted = [...entries].sort((a, b) => b.date.getTime() - a.date.getTime());
  const monthCount = PERIOD_MONTHS[period];
  const distinctMonths = [...new Set(sorted.map(e => formatMonthLabel(e.date)))];
  const prevMonths = new Set(distinctMonths.slice(monthCount, monthCount * 2));
  return sorted.filter(e => prevMonths.has(formatMonthLabel(e.date)));
}

export function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

function formatPeriodLabel(entries: ParsedSummary[], period: TimePeriod): string {
  if (entries.length === 0) return '';

  const sorted = [...entries].sort((a, b) => a.date.getTime() - b.date.getTime());
  const first = sorted[0].date;
  const last = sorted[sorted.length - 1].date;

  if (period === '1m') {
    return first.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }
  if (period === '1y') {
    return first.getFullYear().toString();
  }
  const firstMonth = first.toLocaleDateString('en-US', { month: 'short' });
  const lastMonth = last.toLocaleDateString('en-US', { month: 'short' });
  const year = last.getFullYear();
  return `${firstMonth} – ${lastMonth} ${year}`;
}

export interface MeterEntry {
  connectionId: number
  connectionLabel: string
  meterId?: string
  meterTitle: string
  summaries: GreenButtonSummary[] | undefined
}

// useEnergyDashboard pipeline:
// 1. Parse: convert raw GreenButton summaries into normalized meter records
// 2. Filter: split into current period and previous period
// 3. Aggregate: sum cost, consumption, carbon across all meters
// 4. Stats: build dashboard stats with period-over-period deltas
// 5. Group by month: build monthly consumption and cost-per-provider chart data
// 6. Group by provider: build provider detail cards and spend breakdown
export function useEnergyDashboard(
  meterEntries: MeterEntry[],
  period: TimePeriod,
) {
  return useMemo(() => {
    // 1. Parse
    const allParsedMeters = meterEntries.flatMap((entry) => {
      if (!entry.summaries) return [];
      return entry.summaries
        .map((s) => {
          const parsed = parseGreenButtonSummary(s, entry.connectionId);
          return parsed ? { ...parsed, connectionLabel: entry.connectionLabel, meterTitle: entry.meterTitle } : null;
        })
        .filter((p): p is NonNullable<typeof p> => p !== null);
    });

    // 2. Filter
    const filteredMeters = filterByPeriod(allParsedMeters, period);
    const previousMeters = filterPreviousPeriod(allParsedMeters, period);

    // 3. Aggregate
    let totalCost = 0;
    let totalConsumption = 0;
    for (const entry of filteredMeters) {
      totalCost += entry.costDollars;
      totalConsumption += entry.consumptionKwh;
    }
    const totalCarbon = totalConsumption * CARBON_LBS_PER_KWH;

    // Previous period totals (for deltas)
    let prevCost = 0;
    let prevConsumption = 0;
    for (const entry of previousMeters) {
      prevCost += entry.costDollars;
      prevConsumption += entry.consumptionKwh;
    }
    const prevCarbon = prevConsumption * CARBON_LBS_PER_KWH;

    const deltas: StatDeltas = previousMeters.length > 0
      ? {
          carbonPct: pctChange(totalCarbon, prevCarbon),
          consumptionPct: pctChange(totalConsumption, prevConsumption),
          costPct: pctChange(totalCost, prevCost),
        }
      : { carbonPct: null, consumptionPct: null, costPct: null };

    // 4. Stats
    const stats: DashboardStats = {
      carbonFootprintLbs: totalCarbon,
      deltas,
      emissionsMtCo2: totalCarbon * LBS_TO_METRIC_TONS,
      totalConsumptionKwh: totalConsumption,
      totalCostDollars: totalCost,
    };

    // 5. Group by month
    const monthMap = new Map<string, number>();
    const chronological = [...filteredMeters].sort((a, b) => a.date.getTime() - b.date.getTime());
    for (const entry of chronological) {
      const label = formatMonthLabel(entry.date);
      monthMap.set(label, (monthMap.get(label) ?? 0) + entry.consumptionKwh);
    }
    const monthlyConsumption: MonthlyConsumption = {
      data: [...monthMap.values()],
      labels: [...monthMap.keys()],
    };

    // 6. Group by provider
    const mixMap = new Map<string, { connectionId: number, costDollars: number, kWh: number }>();
    for (const entry of filteredMeters) {
      const existing = mixMap.get(entry.connectionLabel);
      mixMap.set(entry.connectionLabel, {
        connectionId: entry.connectionId,
        costDollars: (existing?.costDollars ?? 0) + entry.costDollars,
        kWh: (existing?.kWh ?? 0) + entry.consumptionKwh,
      });
    }
    // Provider details: enriched per-provider data for provider cards
    const providerDetails: ProviderDetail[] = [...mixMap.entries()].map(([label, val]) => {
      const meterCount = meterEntries.filter(e => e.connectionLabel === label).length;
      const prevProviderCost = previousMeters
        .filter(e => e.connectionLabel === label)
        .reduce((sum, e) => sum + e.costDollars, 0);

      return {
        connectionId: val.connectionId,
        costDeltaPct: previousMeters.length > 0 ? pctChange(val.costDollars, prevProviderCost) : null,
        costDollars: val.costDollars,
        emissionsMtCo2: val.kWh * CARBON_LBS_PER_KWH * LBS_TO_METRIC_TONS,
        kWh: val.kWh,
        label,
        meterCount,
        shareOfSpendPct: totalCost > 0 ? (val.costDollars / totalCost) * 100 : 0,
      };
    });

    // Monthly consumption per provider (for stacked bar chart)
    const providerLabels = [...mixMap.keys()];
    const monthLabels = [...monthMap.keys()];
    const PROVIDER_PALETTE = [
      'rgba(13, 148, 136, 0.7)',
      'rgba(8, 145, 178, 0.7)',
      'rgba(22, 163, 74, 0.7)',
      'rgba(217, 119, 6, 0.7)',
      'rgba(71, 85, 105, 0.7)',
      'rgba(124, 58, 237, 0.7)',
    ];

    const monthlyByProvider: MonthlyProviderConsumption = {
      datasets: providerLabels.map((provider, i) => {
        const providerEntries = chronological.filter(e => e.connectionLabel === provider);
        const dataByMonth = monthLabels.map(month =>
          providerEntries
            .filter(e => formatMonthLabel(e.date) === month)
            .reduce((sum, e) => sum + e.consumptionKwh, 0),
        );
        const costByMonth = monthLabels.map(month =>
          providerEntries
            .filter(e => formatMonthLabel(e.date) === month)
            .reduce((sum, e) => sum + e.costDollars, 0),
        );
        return {
          color: PROVIDER_PALETTE[i % PROVIDER_PALETTE.length],
          costDollars: costByMonth,
          data: dataByMonth,
          label: provider,
        };
      }),
      labels: monthLabels,
    };

    // Monthly cost per provider (for cost trend line chart)
    const monthlyCost: MonthlyCostData = {
      datasets: providerLabels.map((provider, i) => {
        const providerEntries = chronological.filter(e => e.connectionLabel === provider);
        const costByMonth = monthLabels.map(month =>
          providerEntries
            .filter(e => formatMonthLabel(e.date) === month)
            .reduce((sum, e) => sum + e.costDollars, 0),
        );
        return {
          color: PROVIDER_PALETTE[i % PROVIDER_PALETTE.length],
          data: costByMonth,
          label: provider,
        };
      }),
      labels: monthLabels,
    };

    const periodLabel = formatPeriodLabel(filteredMeters, period);

    // 7. Per-meter breakdown (for connection detail view)
    const meterDetails: MeterDetail[] = meterEntries
      .filter(entry => entry.meterId && entry.summaries && entry.summaries.length > 0)
      .map(entry => {
        const parsed = (entry.summaries ?? [])
          .map(s => {
            const p = parseGreenButtonSummary(s, entry.connectionId);
            return p ? { ...p, connectionLabel: entry.connectionLabel, meterTitle: entry.meterTitle } : null;
          })
          .filter((p): p is NonNullable<typeof p> => p !== null);

        const current = filterByPeriod(parsed, period);
        const prev = filterPreviousPeriod(parsed, period);

        let costDollars = 0;
        let kWh = 0;
        for (const e of current) { costDollars += e.costDollars; kWh += e.consumptionKwh; }

        let prevCost = 0;
        for (const e of prev) { prevCost += e.costDollars; }

        return {
          costDeltaPct: prev.length > 0 ? pctChange(costDollars, prevCost) : null,
          costDollars,
          costPerKWh: kWh > 0 ? costDollars / kWh : 0,
          emissionsMtCo2: kWh * CARBON_LBS_PER_KWH * LBS_TO_METRIC_TONS,
          kWh,
          meterId: entry.meterId as string,
          meterTitle: entry.meterTitle,
          shareOfSpendPct: 0,
        };
      });

    const totalMeterCost = meterDetails.reduce((sum, d) => sum + d.costDollars, 0);
    for (const detail of meterDetails) {
      detail.shareOfSpendPct = totalMeterCost > 0 ? (detail.costDollars / totalMeterCost) * 100 : 0;
    }

    return { meterDetails, monthlyByProvider, monthlyConsumption, monthlyCost, periodLabel, providerDetails, stats };
  }, [meterEntries, period]);
}
