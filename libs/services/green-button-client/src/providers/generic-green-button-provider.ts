import {
  AtomFeed,
  ElectricalDataRequest,
  ElectricalDataSummary,
  ElectricalDataSummaryRequest,
  ElectricalDataUsagePoint,
} from '@shared';
import { AxiosInstance } from 'axios';
import { GreenButtonService } from '../green-button-service';
import { XMLParser } from 'fast-xml-parser';

export class GenericGreenButtonProvider implements GreenButtonService {
  private http: AxiosInstance;
  private baseUrl: string;

  constructor(http: AxiosInstance, baseUrl: string) {
    this.http = http;
    this.baseUrl = baseUrl;
  }

  async fetchUsagePoints(token: string, request: ElectricalDataRequest): Promise<ElectricalDataUsagePoint[]> {
    // https://sandbox.greenbuttonalliance.org:8443/DataCustodian/espi/1_1/resource/Subscription/1/UsagePoint
    const url = `${this.baseUrl}/espi/1_1/resource/Subscription/1/UsagePoint`;

    const response = await this.http.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        max: request.max,
        min: request.min,
      },
    });

    const parser = new XMLParser({ ignoreAttributes: false });
    const parsedData = parser.parse(response.data) as AtomFeed;

    return this.parseUsagePoints(parsedData);
  }

  async fetchSummary(token: string, request: ElectricalDataSummaryRequest): Promise<ElectricalDataSummary[]> {
    // https://sandbox.greenbuttonalliance.org:8443/DataCustodian/espi/1_1/resource/Subscription/1/UsagePoint/1/ElectricPowerUsageSummary
    const url = `${this.baseUrl}/espi/1_1/resource/Subscription/1/UsagePoint/${request.meterId}/ElectricPowerUsageSummary`;

    const response = await this.http.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        max: request.max,
        min: request.min,
      },
    });

    const parser = new XMLParser({ ignoreAttributes: false, removeNSPrefix: true });
    const parsedData = parser.parse(response.data) as AtomFeed;

    return this.parseSummary(parsedData);
  }

  private parseUsagePoints(atomFeed: AtomFeed): ElectricalDataUsagePoint[] {
    const usagePoints = atomFeed?.feed?.entry as ElectricalDataUsagePoint[];

    return usagePoints;
  }

  private parseSummary(atomFeed: AtomFeed): ElectricalDataSummary[] {
    const summary = atomFeed?.feed?.entry as ElectricalDataSummary[];

    return summary;
  }
}
