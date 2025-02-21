export interface ElectricalData {
  id: string
  startTime: string // ISO timestamp
  endTime: string
}

export interface ElectricalDataSummary extends ElectricalData {
  usage: number // kWh
  peakDemand?: number // kW
}

export interface ElectricalDataUsagePoint extends ElectricalData {
  title: string
  summary: string
}

export interface ElectricalDataRequest {
  min?: string // ISO date
  max?: string // ISO date
}

export interface ElectricalDataSummaryRequest extends ElectricalDataRequest {
  meterId: string
}

export interface AtomFeedUsagePoint {
  feed?: {
    entry?: ElectricalDataUsagePoint[]
  }
}

export interface AtomFeedSummary {
  feed?: {
    entry?: ElectricalDataSummary
  }
}
