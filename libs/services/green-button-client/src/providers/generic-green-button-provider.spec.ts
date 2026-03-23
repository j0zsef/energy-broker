import { AxiosInstance } from 'axios';
import { GenericGreenButtonProvider } from './generic-green-button-provider';

const usagePointsXml = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom"
      xmlns:espi="http://naesb.org/espi">
  <id>urn:uuid:mock-feed-usage-points</id>
  <title>Mock Usage Points</title>
  <entry>
    <id>urn:uuid:usage-point-1</id>
    <title>Residential Meter</title>
    <published>2024-01-15T00:00:00Z</published>
    <link rel="self" href="https://api.example.com/UsagePoint/1"/>
    <link rel="related" href="https://api.example.com/UsagePoint/1/MeterReading"/>
    <content>
      <espi:UsagePoint>
        <espi:ServiceCategory>
          <espi:kind>0</espi:kind>
        </espi:ServiceCategory>
      </espi:UsagePoint>
    </content>
  </entry>
  <entry>
    <id>urn:uuid:usage-point-2</id>
    <title>Solar Generation</title>
    <published>2024-06-01T00:00:00Z</published>
    <link rel="self" href="https://api.example.com/UsagePoint/2"/>
    <link rel="related" href="https://api.example.com/UsagePoint/2/MeterReading"/>
    <content>
      <espi:UsagePoint>
        <espi:ServiceCategory>
          <espi:kind>0</espi:kind>
        </espi:ServiceCategory>
      </espi:UsagePoint>
    </content>
  </entry>
</feed>`;

const summaryXml = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom"
      xmlns:espi="http://naesb.org/espi">
  <id>urn:uuid:mock-feed-summary-1</id>
  <title>Electric Power Usage Summary</title>
  <entry>
    <id>urn:uuid:summary-1-1</id>
    <title>Residential Meter - January 2025</title>
    <published>2025-03-01T00:00:00Z</published>
    <content>
      <espi:ElectricPowerUsageSummary>
        <espi:billingPeriod>
          <espi:duration>2678400</espi:duration>
          <espi:start>1735689600</espi:start>
        </espi:billingPeriod>
        <espi:billLastPeriod>9245</espi:billLastPeriod>
        <espi:overallConsumptionLastPeriod>
          <espi:powerOfTenMultiplier>0</espi:powerOfTenMultiplier>
          <espi:uom>72</espi:uom>
          <espi:value>680000</espi:value>
        </espi:overallConsumptionLastPeriod>
      </espi:ElectricPowerUsageSummary>
    </content>
  </entry>
  <entry>
    <id>urn:uuid:summary-1-2</id>
    <title>Residential Meter - February 2025</title>
    <published>2025-03-01T00:00:00Z</published>
    <content>
      <espi:ElectricPowerUsageSummary>
        <espi:billingPeriod>
          <espi:duration>2419200</espi:duration>
          <espi:start>1738368000</espi:start>
        </espi:billingPeriod>
        <espi:billLastPeriod>7830</espi:billLastPeriod>
        <espi:overallConsumptionLastPeriod>
          <espi:powerOfTenMultiplier>0</espi:powerOfTenMultiplier>
          <espi:uom>72</espi:uom>
          <espi:value>520000</espi:value>
        </espi:overallConsumptionLastPeriod>
      </espi:ElectricPowerUsageSummary>
    </content>
  </entry>
</feed>`;

function createMockAxios(responseData: string): AxiosInstance {
  return {
    get: jest.fn().mockResolvedValue({ data: responseData }),
  } as unknown as AxiosInstance;
}

describe('GenericGreenButtonProvider', () => {
  const baseUrl = 'https://api.example.com';
  const token = 'test-token';

  describe('fetchUsagePoints', () => {
    it('parses usage points and extracts meterIds from self links', async () => {
      const mockHttp = createMockAxios(usagePointsXml);
      const provider = new GenericGreenButtonProvider(mockHttp, baseUrl);

      const result = await provider.fetchUsagePoints(token, {});

      expect(result).toHaveLength(2);
      expect(result[0].meterId).toBe('1');
      expect(result[1].meterId).toBe('2');
      expect(result[0].title).toBe('Residential Meter');
      expect(result[1].title).toBe('Solar Generation');
    });

    it('calls the correct URL with authorization header', async () => {
      const mockHttp = createMockAxios(usagePointsXml);
      const provider = new GenericGreenButtonProvider(mockHttp, baseUrl);

      await provider.fetchUsagePoints(token, { max: '2025-03-01', min: '2025-01-01' });

      expect(mockHttp.get).toHaveBeenCalledWith(
        `${baseUrl}/UsagePoint`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { max: '2025-03-01', min: '2025-01-01' },
        },
      );
    });
  });

  describe('fetchSummary', () => {
    it('parses summary data from XML', async () => {
      const mockHttp = createMockAxios(summaryXml);
      const provider = new GenericGreenButtonProvider(mockHttp, baseUrl);

      const result = await provider.fetchSummary(token, { meterId: '1' });

      expect(result).toHaveLength(2);
      expect(result[0].content?.ElectricPowerUsageSummary?.billLastPeriod).toBe(9245);
      expect(result[0].content?.ElectricPowerUsageSummary?.billingPeriod?.start).toBe(1735689600);
      expect(result[0].content?.ElectricPowerUsageSummary?.overallConsumptionLastPeriod?.value).toBe(680000);
      expect(result[1].content?.ElectricPowerUsageSummary?.billLastPeriod).toBe(7830);
    });

    it('calls the correct URL for the given meterId', async () => {
      const mockHttp = createMockAxios(summaryXml);
      const provider = new GenericGreenButtonProvider(mockHttp, baseUrl);

      await provider.fetchSummary(token, { meterId: '42' });

      expect(mockHttp.get).toHaveBeenCalledWith(
        `${baseUrl}/UsagePoint/42/ElectricPowerUsageSummary`,
        expect.objectContaining({
          headers: { Authorization: `Bearer ${token}` },
        }),
      );
    });
  });
});
