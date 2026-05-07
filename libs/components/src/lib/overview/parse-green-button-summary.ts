import { GreenButtonSummary, ParsedSummary } from '@energy-broker/shared';

export function parseGreenButtonSummary(
  summary: GreenButtonSummary, connectionId: number,
): Pick<ParsedSummary, 'connectionId' | 'consumptionKwh' | 'costDollars' | 'date'> | null {
  const electricPowerSummary = summary.content?.ElectricPowerUsageSummary;
  if (!electricPowerSummary) return null;

  const costDollars = (electricPowerSummary.billLastPeriod ?? 0) / 100;

  // Green Button reports consumption in Wh with a power-of-ten multiplier.
  // e.g. value=680, powerOfTenMultiplier=0 → 680 Wh → 0.68 kWh
  //      value=680, powerOfTenMultiplier=3 → 680,000 Wh → 680 kWh
  const consumption = electricPowerSummary.overallConsumptionLastPeriod;
  const rawValue = consumption?.value ?? 0;
  const multiplier = Math.pow(10, consumption?.powerOfTenMultiplier ?? 0);
  const consumptionKwh = (rawValue * multiplier) / 1000;

  const startTimestamp = electricPowerSummary.billingPeriod?.start;
  const date = startTimestamp ? new Date(startTimestamp * 1000) : new Date(summary.published ?? Date.now());

  return { connectionId, consumptionKwh, costDollars, date };
}
