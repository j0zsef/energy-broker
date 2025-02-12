import { ElectricalDataSummary, ElectricalDataSummaryRequest } from 'libs/shared';

export interface GreenButtonService {
  fetchSummary(token: string, request: ElectricalDataSummaryRequest): Promise<ElectricalDataSummary>;
}
