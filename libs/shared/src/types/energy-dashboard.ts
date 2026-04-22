export type TimePeriod = '1m' | '3m' | '1y';

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

export interface MonthlyConsumption {
  data: number[]
  labels: string[]
}

export interface EnergyMixEntry {
  connectionId: number
  costDollars: number
  kWh: number
  label: string
}

export interface MonthlyProviderConsumption {
  /** One dataset per provider, each with values aligned to `labels` */
  datasets: { color: string, costDollars: number[], data: number[], label: string }[]
  labels: string[]
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

export interface MonthlyCostData {
  datasets: { color: string, data: number[], label: string }[]
  labels: string[]
}
