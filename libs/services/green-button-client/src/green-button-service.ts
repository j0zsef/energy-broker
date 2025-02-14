import { ElectricalDataRequest, ElectricalDataSummary, ElectricalDataSummaryRequest, ElectricalDataUsagePoint } from '@shared';

export interface GreenButtonService {
  fetchSummary(token: string, request: ElectricalDataSummaryRequest): Promise<ElectricalDataSummary>
  fetchUsagePoints(token: string, request: ElectricalDataRequest): Promise<ElectricalDataUsagePoint[]>
}
