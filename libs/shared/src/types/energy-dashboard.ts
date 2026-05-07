export type TimePeriod = '1m' | '3m' | '1y';

export const PERIOD_MONTHS: Record<TimePeriod, number> = {
  '1m': 1,
  '1y': 12,
  '3m': 3,
};

export interface StatDeltas {
  carbonPct: number | null
  consumptionPct: number | null
  costPct: number | null
}

export interface DashboardStats {
  carbonFootprintLbs: number
  deltas: StatDeltas
  emissionsMtCo2: number
  totalConsumptionKwh: number
  totalCostDollars: number
}

export interface ProviderDetail {
  connectionId: number
  costDeltaPct: number | null
  costDollars: number
  emissionsMtCo2: number
  kWh: number
  label: string
  meterCount: number
  shareOfSpendPct: number
}
