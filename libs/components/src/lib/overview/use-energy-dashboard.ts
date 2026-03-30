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
  EnergyMixEntry,
  LBS_TO_METRIC_TONS,
  MonthlyConsumption,
  StatDeltas,
  TimePeriod,
} from '@energy-broker/shared';
import { useMemo } from 'react';

export type { DashboardStats, EnergyMixEntry, MonthlyConsumption, StatDeltas, TimePeriod };

export interface MeterEntry {
  connectionId: number
  connectionLabel: string
  meterTitle: string
  summaries: ElectricalDataSummary[] | undefined
}

export function useEnergyDashboard(
  meterEntries: MeterEntry[],
  period: TimePeriod,
) {
  return useMemo(() => {
    const allParsed = meterEntries.flatMap((entry) => {
      if (!entry.summaries) return [];
      return entry.summaries
        .map(s => parseSummary(s, entry.meterTitle, entry.connectionId, entry.connectionLabel))
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
      emissionsMtCo2: totalCarbon * LBS_TO_METRIC_TONS,
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

    // Energy mix: group by connection label (doughnut segments = providers)
    const mixMap = new Map<string, { connectionId: number, kWh: number }>();
    for (const entry of filtered) {
      const existing = mixMap.get(entry.connectionLabel);
      mixMap.set(entry.connectionLabel, {
        connectionId: entry.connectionId,
        kWh: (existing?.kWh ?? 0) + entry.consumptionKwh,
      });
    }
    const energyMix: EnergyMixEntry[] = [...mixMap.entries()].map(
      ([label, val]) => ({ connectionId: val.connectionId, kWh: val.kWh, label }),
    );

    return { energyMix, monthlyConsumption, stats };
  }, [meterEntries, period]);
}
