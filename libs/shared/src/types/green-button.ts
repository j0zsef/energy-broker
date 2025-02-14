export interface ElectricalDataSummary {
  startTime: string; // ISO timestamp
  endTime: string;
  usage: number; // kWh
  peakDemand?: number; // kW
}

export interface ElectricalDataUsagePoint {
  id: string;
  startTime: string; // ISO timestamp
  endTime: string;
  title: string;
  summary: string;
}

export interface ElectricalDataRequest {
  min?: string; // ISO date
  max?: string; // ISO date
}

export interface ElectricalDataSummaryRequest extends ElectricalDataRequest {
  meterId: string;
}
