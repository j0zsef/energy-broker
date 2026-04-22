import { CARBON_LBS_PER_KWH, ElectricalDataSummary, TimePeriod } from '@energy-broker/shared';

export { CARBON_LBS_PER_KWH };

export interface ParsedSummary {
  connectionId: number
  connectionLabel: string
  consumptionKwh: number
  costDollars: number
  date: Date
  meterTitle: string
}

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
  const monthCount = getMonthCount(period);
  const distinctMonths = [...new Set(sorted.map(e => formatMonthLabel(e.date)))];
  const allowedMonths = new Set(distinctMonths.slice(0, monthCount));
  return sorted.filter(e => allowedMonths.has(formatMonthLabel(e.date)));
}

export function filterPreviousPeriod(entries: ParsedSummary[], period: TimePeriod): ParsedSummary[] {
  const sorted = [...entries].sort((a, b) => b.date.getTime() - a.date.getTime());
  const monthCount = getMonthCount(period);
  const distinctMonths = [...new Set(sorted.map(e => formatMonthLabel(e.date)))];
  const prevMonths = new Set(distinctMonths.slice(monthCount, monthCount * 2));
  return sorted.filter(e => prevMonths.has(formatMonthLabel(e.date)));
}

export function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

export function formatMonthLabel(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}

export function formatPeriodLabel(entries: ParsedSummary[], period: TimePeriod): string {
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
  // 3m: "Jan – Mar 2025"
  const firstMonth = first.toLocaleDateString('en-US', { month: 'short' });
  const lastMonth = last.toLocaleDateString('en-US', { month: 'short' });
  const year = last.getFullYear();
  return `${firstMonth} – ${lastMonth} ${year}`;
}
