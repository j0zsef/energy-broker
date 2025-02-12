import { AxiosInstance } from "axios";
import { XMLParser } from "fast-xml-parser";
import { GreenButtonService } from "../green-button-service";
import {ElectricalDataSummary, ElectricalDataSummaryRequest} from 'libs/shared';

export class GenericGreenButtonProvider implements GreenButtonService {
  private http: AxiosInstance;
  private baseUrl: string;

  constructor(http: AxiosInstance, baseUrl: string) {
    this.http = http;
    this.baseUrl = baseUrl;
  }

  async fetchSummary(token: string, request: ElectricalDataSummaryRequest): Promise<ElectricalDataSummary> {
    // https://sandbox.greenbuttonalliance.org:8443/DataCustodian/espi/1_1/resource/Subscription/1/UsagePoint/1/ElectricPowerUsageSummary
    const url = `${this.baseUrl}/espi/1_1/resource/Subscription/1/UsagePoint/${request.meterId}/ElectricPowerUsageSummary`;

    const response = await this.http.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/xml",
      },
      params: {
        min: request.min,
        max: request.max,
      },
    });

    const parser = new XMLParser({ ignoreAttributes: false });
    const parsedData = parser.parse(response.data);

    return this.parseSummary(parsedData);
  }

  private parseSummary(parsedXml: any): ElectricalDataSummary {
    const intervalBlock = parsedXml?.feed?.entry?.content?.IntervalBlock;
    const startTime = intervalBlock?.interval?.start;
    const endTime = intervalBlock?.interval?.end;
    const usage = intervalBlock?.IntervalReading?.value || 0;

    return {
      startTime: new Date(parseInt(startTime) * 1000).toISOString(),
      endTime: new Date(parseInt(endTime) * 1000).toISOString(),
      usage: parseFloat(usage),
    };
  }
}
