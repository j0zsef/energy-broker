export interface ElectricalDataSummary {
  id?: string
  content?: {
    ElectricPowerUsageSummary?: {
      billingPeriod?: {
        duration?: number
        start?: number
      }
    }
  }
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
  link: {
    '@_rel': string
  }
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
