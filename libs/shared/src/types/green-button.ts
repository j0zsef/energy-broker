export interface ParsedSummary {
  connectionId: number
  connectionLabel: string
  consumptionKwh: number
  costDollars: number
  date: Date
  meterTitle: string
}

export interface GreenButtonSummary {
  id?: string
  content?: {
    ElectricPowerUsageSummary?: {
      billingPeriod?: {
        duration?: number
        start?: number
      }
      billLastPeriod?: number
      billToDate?: number
      currentBillingPeriodOverAllConsumption?: {
        powerOfTenMultiplier?: number
        uom?: number
        value?: number
      }
      overallConsumptionLastPeriod?: {
        powerOfTenMultiplier?: number
        uom?: number
        value?: number
      }
    }
  }
  link?: [
    {
      '@_href': string
      '@_rel': string
    },
  ]
  published?: string
  title?: string
  updated?: string
}

export interface EnergyUsageRequest {
  connectionId: number
  max?: string
  min?: string
}

export interface GreenButtonUsageRequest {
  max?: string
  min?: string
}

export interface GreenButtonUsagePoint {
  id?: string
  content?: {
    UsagePoint?: {
      ServiceCategory?: {
        kind?: string
      }
    }
  }
  link?: [
    {
      '@_href': string
      '@_rel': string
    },
  ]
  meterId?: string
  published?: string
  title?: string
  updated?: string
}

export interface AtomFeed {
  feed?: {
    entry?: (GreenButtonSummary | GreenButtonUsagePoint)[]
  }
}

export interface EnergySummaryRequest {
  connectionId: number
  meterId: string
  min?: string // ISO date
  max?: string // ISO date
}

export interface GreenButtonSummaryRequest {
  meterId: string
  min?: string // ISO date
  max?: string // ISO date
}
