import {
  ElectricalDataSummary,
  ElectricalDataUsagePoint,
  GreenButtonSummaryRequest,
  GreenButtonUsageRequest,
} from '@shared';

export interface GreenButtonService {
  fetchSummary(token: string, request: GreenButtonSummaryRequest): Promise<ElectricalDataSummary[]>
  fetchUsagePoints(token: string, request: GreenButtonUsageRequest): Promise<ElectricalDataUsagePoint[]>
}
