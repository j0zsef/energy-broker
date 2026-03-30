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
  kWh: number
  label: string
}
