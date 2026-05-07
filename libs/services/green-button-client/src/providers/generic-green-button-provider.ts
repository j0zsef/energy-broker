import {
  AtomFeed,
  GreenButtonSummary,
  GreenButtonUsagePoint,
  GreenButtonSummaryRequest,
  GreenButtonUsageRequest,
} from '@energy-broker/shared';
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

  async fetchUsagePoints(token: string, request: GreenButtonUsageRequest): Promise<GreenButtonUsagePoint[]> {
    const url = `${this.baseUrl}/UsagePoint`;

    const response = await this.http.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        max: request.max,
        min: request.min,
      },
    });

    const parser = new XMLParser({
      attributeNamePrefix: '@_',
      ignoreAttributes: false,
      isArray: name => name === 'entry' || name === 'link',
      removeNSPrefix: true,
    });
    const parsedData = parser.parse(response.data) as AtomFeed;

    return this.parseUsagePoints(parsedData);
  }

  async fetchSummary(token: string, request: GreenButtonSummaryRequest): Promise<GreenButtonSummary[]> {
    const url = `${this.baseUrl}/UsagePoint/${request.meterId}/ElectricPowerUsageSummary`;

    const response = await this.http.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        max: request.max,
        min: request.min,
      },
    });

    const parser = new XMLParser({
      ignoreAttributes: false,
      isArray: name => name === 'entry' || name === 'link',
      removeNSPrefix: true,
    });
    const parsedData = parser.parse(response.data) as AtomFeed;

    return this.parseSummary(parsedData);
  }

  private parseUsagePoints(atomFeed: AtomFeed): GreenButtonUsagePoint[] {
    const usagePoints = atomFeed?.feed?.entry as GreenButtonUsagePoint[];

    const parsedUsagePoints = usagePoints.map<GreenButtonUsagePoint>((usagePoint) => {
      const usagePointSelfLink = usagePoint?.link?.find(link => link['@_rel'] === 'self');
      usagePoint.meterId = usagePointSelfLink ? usagePointSelfLink['@_href'].split('/').pop() : undefined;
      return usagePoint;
    });

    return parsedUsagePoints;
  }

  private parseSummary(atomFeed: AtomFeed): GreenButtonSummary[] {
    const summary = atomFeed?.feed?.entry as GreenButtonSummary[];

    return summary;
  }
}
