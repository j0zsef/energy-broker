export interface ElectricalDataSummary {
  startTime: string; // ISO timestamp
  endTime: string;
  usage: number; // kWh
  peakDemand?: number; // kW
}

export interface ElectricalDataSummaryRequest {
  min?: string; // ISO date
  max?: string; // ISO date
  meterId: string;
}
