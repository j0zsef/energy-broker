import {
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
        Accept: 'application/xml',
        Authorization: `Bearer ${token}`,
      },
      params: {
        max: request.max,
        min: request.min,
      },
    });

    const parser = new XMLParser({ ignoreAttributes: false });
    const parsedData = parser.parse(response.data);

    return this.parseUsagePoints(parsedData);
  }

  async fetchSummary(token: string, request: ElectricalDataSummaryRequest): Promise<ElectricalDataSummary> {
    // https://sandbox.greenbuttonalliance.org:8443/DataCustodian/espi/1_1/resource/Subscription/1/UsagePoint/1/ElectricPowerUsageSummary
    const url = `${this.baseUrl}/espi/1_1/resource/Subscription/1/UsagePoint/${request.meterId}/ElectricPowerUsageSummary`;

    const response = await this.http.get(url, {
      headers: {
        Accept: 'application/xml',
        Authorization: `Bearer ${token}`,
      },
      params: {
        max: request.max,
        min: request.min,
      },
    });

    const parser = new XMLParser({ ignoreAttributes: false });
    const parsedData = parser.parse(response.data);

    return this.parseSummary(parsedData);
  }

  private parseUsagePoints(parsedXml: any): ElectricalDataUsagePoint[] {
    const usagePoints = parsedXml?.feed?.entry || [];

    return usagePoints.map((usagePoint: any) => {
      const id = usagePoint?.id;
      const title = usagePoint?.title;
      const summary = usagePoint?.summary;
      const startTime = usagePoint?.content?.ElectricPowerUsageSummary?.interval?.start;
      const endTime = usagePoint?.content?.ElectricPowerUsageSummary?.interval?.end;

      return {
        endTime: new Date(parseInt(endTime) * 1000).toISOString(),
        id,
        startTime: new Date(parseInt(startTime) * 1000).toISOString(),
        summary,
        title,
      };
    });
  }

  private parseSummary(parsedXml: any): ElectricalDataSummary {
    const intervalBlock = parsedXml?.feed?.entry?.content?.IntervalBlock;
    const startTime = intervalBlock?.interval?.start;
    const endTime = intervalBlock?.interval?.end;
    const usage = intervalBlock?.IntervalReading?.value || 0;

    return {
      endTime: new Date(parseInt(endTime) * 1000).toISOString(),
      startTime: new Date(parseInt(startTime) * 1000).toISOString(),
      usage: parseFloat(usage),
    };
  }
}
