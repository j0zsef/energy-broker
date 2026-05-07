import {
  CARBON_LBS_PER_KWH,
  DashboardStats,
  GreenButtonSummary,
  LBS_TO_METRIC_TONS,
  MeterDetail,
  PERIOD_MONTHS,
  ParsedSummary,
  ProviderDetail,
  StatDeltas,
  TimePeriod,
} from '@energy-broker/shared';
import { parseGreenButtonSummary } from './parse-green-button-summary';
import { useMemo } from 'react';

export type { DashboardStats, ParsedSummary, ProviderDetail, StatDeltas, TimePeriod };

export interface MeterEntry {
  connectionId: number
  connectionLabel: string
  meterId?: string
  meterTitle: string
  summaries: GreenButtonSummary[] | null
}

type EnergyProviderAggregate = { connectionId: number, costDollars: number, kWh: number };

export function formatMonthLabel(date: Date): string {
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

function buildEnergyProviderDetails(
  mixMap: Map<string, EnergyProviderAggregate>,
  meterEntries: MeterEntry[],
  previousMeters: ParsedSummary[],
  totalCost: number,
): ProviderDetail[] {
  return [...mixMap.entries()].map(([label, val]) => {
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
}

function buildEnergyMeterDetails(meterEntries: MeterEntry[], period: TimePeriod): MeterDetail[] {
  const meterDetails: MeterDetail[] = meterEntries
    .filter(entry => entry.meterId && entry.summaries && entry.summaries.length > 0)
    .map((entry) => {
      const parsed = (entry.summaries ?? [])
        .map((s) => {
          const p = parseGreenButtonSummary(s, entry.connectionId);
          return p ? { ...p, connectionLabel: entry.connectionLabel, meterTitle: entry.meterTitle } : null;
        })
        .filter((p): p is NonNullable<typeof p> => p !== null);

      const current = filterByPeriod(parsed, period);
      const prev = filterPreviousPeriod(parsed, period);

      const costDollars = current.reduce((sum, e) => sum + e.costDollars, 0);
      const kWh = current.reduce((sum, e) => sum + e.consumptionKwh, 0);
      const prevCost = prev.reduce((sum, e) => sum + e.costDollars, 0);

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

  return meterDetails;
}

// computeEnergyDashboard pipeline:
// 1. Parse: convert raw GreenButton summaries into normalized ParsedSummary records
// 2. Filter: split into current period and previous period
// 3. Aggregate: sum cost, consumption, carbon across all meters
// 4. Stats: build DashboardStats with period-over-period deltas
// 5. Provider details: ProviderDetail cards and spend breakdown
// 6. Meter details: per-meter breakdown for connection detail view
function computeEnergyDashboard(meterEntries: MeterEntry[], period: TimePeriod) {
  // 1. Parse
  const allParsedMeters = meterEntries.flatMap((entry) => {
    if (!entry.summaries) return [];
    return entry.summaries
      .map((s) => {
        const p = parseGreenButtonSummary(s, entry.connectionId);
        return p ? { ...p, connectionLabel: entry.connectionLabel, meterTitle: entry.meterTitle } : null;
      })
      .filter((p): p is NonNullable<typeof p> => p !== null);
  });

  // 2. Filter
  const filteredMeters = filterByPeriod(allParsedMeters, period);
  const previousMeters = filterPreviousPeriod(allParsedMeters, period);

  // 3. Aggregate
  const totalCost = filteredMeters.reduce((sum, e) => sum + e.costDollars, 0);
  const totalConsumption = filteredMeters.reduce((sum, e) => sum + e.consumptionKwh, 0);
  const totalCarbon = totalConsumption * CARBON_LBS_PER_KWH;
  const prevCost = previousMeters.reduce((sum, e) => sum + e.costDollars, 0);
  const prevConsumption = previousMeters.reduce((sum, e) => sum + e.consumptionKwh, 0);
  const prevCarbon = prevConsumption * CARBON_LBS_PER_KWH;

  // 4. Stats
  const deltas: StatDeltas = previousMeters.length > 0
    ? {
        carbonPct: pctChange(totalCarbon, prevCarbon),
        consumptionPct: pctChange(totalConsumption, prevConsumption),
        costPct: pctChange(totalCost, prevCost),
      }
    : { carbonPct: null, consumptionPct: null, costPct: null };

  const dashboardStats: DashboardStats = {
    carbonFootprintLbs: totalCarbon,
    deltas,
    emissionsMtCo2: totalCarbon * LBS_TO_METRIC_TONS,
    totalConsumptionKwh: totalConsumption,
    totalCostDollars: totalCost,
  };

  // 5. Provider details
  const mixMap = new Map<string, EnergyProviderAggregate>();
  for (const entry of filteredMeters) {
    const existing = mixMap.get(entry.connectionLabel);
    mixMap.set(entry.connectionLabel, {
      connectionId: entry.connectionId,
      costDollars: (existing?.costDollars ?? 0) + entry.costDollars,
      kWh: (existing?.kWh ?? 0) + entry.consumptionKwh,
    });
  }
  const providerDetails = buildEnergyProviderDetails(mixMap, meterEntries, previousMeters, totalCost);

  // 6. Meter details
  const meterDetails = buildEnergyMeterDetails(meterEntries, period);

  return {
    dashboardStats,
    filteredMeters,
    meterDetails,
    periodLabel: formatPeriodLabel(filteredMeters, period),
    providerDetails,
  };
}

export function useEnergyDashboard(meterEntries: MeterEntry[], period: TimePeriod) {
  return useMemo(() => computeEnergyDashboard(meterEntries, period), [meterEntries, period]);
}
