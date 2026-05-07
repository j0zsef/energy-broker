import {
  GreenButtonSummary,
  GreenButtonUsagePoint,
  GreenButtonSummaryRequest,
  GreenButtonUsageRequest,
} from '@energy-broker/shared';

export interface GreenButtonService {
  fetchSummary(token: string, request: GreenButtonSummaryRequest): Promise<GreenButtonSummary[]>
  fetchUsagePoints(token: string, request: GreenButtonUsageRequest): Promise<GreenButtonUsagePoint[]>
}
