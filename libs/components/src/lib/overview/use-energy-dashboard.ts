import {
  CARBON_LBS_PER_KWH,
  filterByPeriod,
  filterPreviousPeriod,
  formatMonthLabel,
  parseSummary,
  pctChange,
} from './energy-dashboard-utils';
import {
  DashboardStats,
  ElectricalDataSummary,
  ElectricalDataUsagePoint,
  EnergyMixEntry,
  MonthlyConsumption,
  StatDeltas,
  TimePeriod,
} from '@energy-broker/shared';
import { useMemo } from 'react';

export type { DashboardStats, EnergyMixEntry, MonthlyConsumption, StatDeltas, TimePeriod };

export function useEnergyDashboard(
  summaries: (ElectricalDataSummary[] | undefined)[],
  meters: ElectricalDataUsagePoint[],
  period: TimePeriod,
  connectionId = 0,
) {
  return useMemo(() => {
    const allParsed = summaries.flatMap((meterSummaries, idx) => {
      if (!meterSummaries) return [];
      const meterTitle = meters[idx]?.title ?? `Meter ${idx + 1}`;
      return meterSummaries
        .map(s => parseSummary(s, meterTitle, connectionId))
        .filter((p): p is NonNullable<typeof p> => p !== null);
    });

    const filtered = filterByPeriod(allParsed, period);
    const previous = filterPreviousPeriod(allParsed, period);

    // Current period totals
    let totalCost = 0;
    let totalConsumption = 0;
    for (const entry of filtered) {
      totalCost += entry.costDollars;
      totalConsumption += entry.consumptionKwh;
    }
    const totalCarbon = totalConsumption * CARBON_LBS_PER_KWH;

    // Previous period totals (for deltas)
    let prevCost = 0;
    let prevConsumption = 0;
    for (const entry of previous) {
      prevCost += entry.costDollars;
      prevConsumption += entry.consumptionKwh;
    }
    const prevCarbon = prevConsumption * CARBON_LBS_PER_KWH;

    const deltas: StatDeltas = previous.length > 0
      ? {
          carbonPct: pctChange(totalCarbon, prevCarbon),
          consumptionPct: pctChange(totalConsumption, prevConsumption),
          costPct: pctChange(totalCost, prevCost),
        }
      : { carbonPct: null, consumptionPct: null, costPct: null };

    const stats: DashboardStats = {
      carbonFootprintLbs: totalCarbon,
      deltas,
      totalConsumptionKwh: totalConsumption,
      totalCostDollars: totalCost,
    };

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
    const mixMap = new Map<string, { connectionId: number, kWh: number }>();
    for (const entry of filtered) {
      const existing = mixMap.get(entry.meterTitle);
      mixMap.set(entry.meterTitle, {
        connectionId: entry.connectionId,
        kWh: (existing?.kWh ?? 0) + entry.consumptionKwh,
      });
    }
    const energyMix: EnergyMixEntry[] = [...mixMap.entries()].map(
      ([label, val]) => ({ connectionId: val.connectionId, kWh: val.kWh, label }),
    );

    return { energyMix, monthlyConsumption, stats };
  }, [summaries, meters, period, connectionId]);
}
