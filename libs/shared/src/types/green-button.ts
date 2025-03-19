export interface ElectricalDataSummary {
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

export interface ElectricalDataUsagePoint {
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
    entry?: (ElectricalDataSummary | ElectricalDataUsagePoint)[]
  }
}

export interface ElectricalDataRequest {
  min?: string // ISO date
  max?: string // ISO date
}

export interface ElectricalDataSummaryRequest extends ElectricalDataRequest {
  meterId: string
}
