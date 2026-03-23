import { ElectricalDataSummary, TimePeriod } from '@energy-broker/shared';

export interface ParsedSummary {
  connectionId: number
  connectionLabel: string
  consumptionKwh: number
  costDollars: number
  date: Date
  meterTitle: string
}

export const CARBON_LBS_PER_KWH = 0.86;

export function parseSummary(
  summary: ElectricalDataSummary, meterTitle: string, connectionId: number, connectionLabel: string,
): ParsedSummary | null {
  const eps = summary.content?.ElectricPowerUsageSummary;
  if (!eps) return null;

  const costDollars = (eps.billLastPeriod ?? 0) / 100;

  const consumption = eps.overallConsumptionLastPeriod;
  const rawValue = consumption?.value ?? 0;
  const multiplier = Math.pow(10, consumption?.powerOfTenMultiplier ?? 0);
  const consumptionKwh = (rawValue * multiplier) / 1000;

  const startTimestamp = eps.billingPeriod?.start;
  const date = startTimestamp ? new Date(startTimestamp * 1000) : new Date(summary.published ?? Date.now());

  return { connectionId, connectionLabel, consumptionKwh, costDollars, date, meterTitle };
}

export function getMonthCount(period: TimePeriod): number {
  return period === '1m' ? 1 : period === '3m' ? 3 : 12;
}

export function filterByPeriod(entries: ParsedSummary[], period: TimePeriod): ParsedSummary[] {
  const sorted = [...entries].sort((a, b) => b.date.getTime() - a.date.getTime());
  return sorted.slice(0, getMonthCount(period));
}

export function filterPreviousPeriod(entries: ParsedSummary[], period: TimePeriod): ParsedSummary[] {
  const sorted = [...entries].sort((a, b) => b.date.getTime() - a.date.getTime());
  const count = getMonthCount(period);
  return sorted.slice(count, count * 2);
}

export function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

export function formatMonthLabel(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}
