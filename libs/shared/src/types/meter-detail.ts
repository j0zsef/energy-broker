export interface MeterDetail {
  costDeltaPct: number | null
  costDollars: number
  costPerKWh: number
  emissionsMtCo2: number
  kWh: number
  meterId: string
  meterTitle: string
  shareOfSpendPct: number
}
