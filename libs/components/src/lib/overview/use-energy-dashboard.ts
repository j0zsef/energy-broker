import { ElectricalDataSummary, ElectricalDataUsagePoint } from '@energy-broker/shared';
import { useMemo } from 'react';

export type TimePeriod = '1m' | '3m' | '1y';

export interface DashboardStats {
  carbonFootprintLbs: number
  totalConsumptionKwh: number
  totalCostDollars: number
}

export interface MonthlyConsumption {
  data: number[]
  labels: string[]
}

export interface EnergyMixEntry {
  kWh: number
  label: string
}

interface ParsedSummary {
  consumptionKwh: number
  costDollars: number
  date: Date
  meterTitle: string
}

const CARBON_LBS_PER_KWH = 0.86;

function parseSummary(summary: ElectricalDataSummary, meterTitle: string): ParsedSummary | null {
  const eps = summary.content?.ElectricPowerUsageSummary;
  if (!eps) return null;

  const costDollars = (eps.billLastPeriod ?? 0) / 100;

  const consumption = eps.overallConsumptionLastPeriod;
  const rawValue = consumption?.value ?? 0;
  const multiplier = Math.pow(10, consumption?.powerOfTenMultiplier ?? 0);
  const consumptionKwh = (rawValue * multiplier) / 1000;

  const startTimestamp = eps.billingPeriod?.start;
  const date = startTimestamp ? new Date(startTimestamp * 1000) : new Date(summary.published ?? Date.now());

  return { consumptionKwh, costDollars, date, meterTitle };
}

function filterByPeriod(entries: ParsedSummary[], period: TimePeriod): ParsedSummary[] {
  const sorted = [...entries].sort((a, b) => b.date.getTime() - a.date.getTime());
  const monthCount = period === '1m' ? 1 : period === '3m' ? 3 : 12;
  return sorted.slice(0, monthCount);
}

function formatMonthLabel(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}

export function useEnergyDashboard(
  summaries: (ElectricalDataSummary[] | undefined)[],
  meters: ElectricalDataUsagePoint[],
  period: TimePeriod,
) {
  return useMemo(() => {
    const allParsed: ParsedSummary[] = [];

    summaries.forEach((meterSummaries, idx) => {
      if (!meterSummaries) return;
      const meterTitle = meters[idx]?.title ?? `Meter ${idx + 1}`;
      for (const s of meterSummaries) {
        const parsed = parseSummary(s, meterTitle);
        if (parsed) allParsed.push(parsed);
      }
    });

    const filtered = filterByPeriod(allParsed, period);

    const stats: DashboardStats = {
      carbonFootprintLbs: 0,
      totalConsumptionKwh: 0,
      totalCostDollars: 0,
    };
    for (const entry of filtered) {
      stats.totalCostDollars += entry.costDollars;
      stats.totalConsumptionKwh += entry.consumptionKwh;
    }
    stats.carbonFootprintLbs = stats.totalConsumptionKwh * CARBON_LBS_PER_KWH;

    // Monthly consumption: group by month label, chronological order
    const monthMap = new Map<string, number>();
    const chronological = [...filtered].sort((a, b) => a.date.getTime() - b.date.getTime());
    for (const entry of chronological) {
      const label = formatMonthLabel(entry.date);
      monthMap.set(label, (monthMap.get(label) ?? 0) + entry.consumptionKwh);
    }
    const monthlyConsumption: MonthlyConsumption = {
      data: [...monthMap.values()],
      labels: [...monthMap.keys()],
    };

    // Energy mix: group by meter
    const mixMap = new Map<string, number>();
    for (const entry of filtered) {
      mixMap.set(entry.meterTitle, (mixMap.get(entry.meterTitle) ?? 0) + entry.consumptionKwh);
    }
    const energyMix: EnergyMixEntry[] = [...mixMap.entries()].map(([label, kWh]) => ({ kWh, label }));

    return { energyMix, monthlyConsumption, stats };
  }, [summaries, meters, period]);
}
