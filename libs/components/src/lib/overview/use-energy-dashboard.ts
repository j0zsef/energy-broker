import {
  CARBON_LBS_PER_KWH,
  filterByPeriod,
  filterPreviousPeriod,
  formatMonthLabel,
  formatPeriodLabel,
  parseSummary,
  pctChange,
} from './energy-dashboard-utils';
import {
  DashboardStats,
  ElectricalDataSummary,
  EnergyMixEntry,
  LBS_TO_METRIC_TONS,
  MonthlyConsumption,
  MonthlyCostData,
  MonthlyProviderConsumption,
  ProviderDetail,
  StatDeltas,
  TimePeriod,
} from '@energy-broker/shared';
import { useMemo } from 'react';

export type { DashboardStats, EnergyMixEntry, MonthlyConsumption, MonthlyCostData, MonthlyProviderConsumption, ProviderDetail, StatDeltas, TimePeriod };

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
    const mixMap = new Map<string, { connectionId: number, costDollars: number, kWh: number }>();
    for (const entry of filtered) {
      const existing = mixMap.get(entry.connectionLabel);
      mixMap.set(entry.connectionLabel, {
        connectionId: entry.connectionId,
        costDollars: (existing?.costDollars ?? 0) + entry.costDollars,
        kWh: (existing?.kWh ?? 0) + entry.consumptionKwh,
      });
    }
    const energyMix: EnergyMixEntry[] = [...mixMap.entries()].map(
      ([label, val]) => ({ connectionId: val.connectionId, costDollars: val.costDollars, kWh: val.kWh, label }),
    );

    // Provider details: enriched per-provider data for provider cards
    const providerDetails: ProviderDetail[] = [...mixMap.entries()].map(([label, val]) => {
      const meterCount = meterEntries.filter(e => e.connectionLabel === label).length;
      const prevProviderCost = previous
        .filter(e => e.connectionLabel === label)
        .reduce((sum, e) => sum + e.costDollars, 0);

      return {
        connectionId: val.connectionId,
        costDeltaPct: previous.length > 0 ? pctChange(val.costDollars, prevProviderCost) : null,
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

    const periodLabel = formatPeriodLabel(filtered, period);

    return { energyMix, monthlyByProvider, monthlyConsumption, monthlyCost, periodLabel, providerDetails, stats };
  }, [meterEntries, period]);
}
