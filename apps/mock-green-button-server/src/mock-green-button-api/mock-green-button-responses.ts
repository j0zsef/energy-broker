// Mock ESPI Atom XML responses for Green Button API
// Green Button conventions:
//   uom 72 = Wh, powerOfTenMultiplier 0 = base Wh
//   Bill amounts in cents (e.g. 9245 = $92.45)
//   billingPeriod.start = Unix epoch seconds
//   billingPeriod.duration = seconds in period

const BASE_PATH = '/espi/1_1/resource/Subscription/1';

export const usagePointsXml = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom"
      xmlns:espi="http://naesb.org/espi">
  <id>urn:uuid:mock-feed-usage-points</id>
  <title>Mock Utility Usage Points</title>
  <updated>2025-03-01T00:00:00Z</updated>
  <entry>
    <id>urn:uuid:usage-point-1</id>
    <title>Residential Meter</title>
    <published>2024-01-15T00:00:00Z</published>
    <updated>2025-03-01T00:00:00Z</updated>
    <link rel="self" href="${BASE_PATH}/UsagePoint/1"/>
    <link rel="related" href="${BASE_PATH}/UsagePoint/1/MeterReading"/>
    <link rel="related" href="${BASE_PATH}/UsagePoint/1/ElectricPowerUsageSummary"/>
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
    <updated>2025-03-01T00:00:00Z</updated>
    <link rel="self" href="${BASE_PATH}/UsagePoint/2"/>
    <link rel="related" href="${BASE_PATH}/UsagePoint/2/MeterReading"/>
    <link rel="related" href="${BASE_PATH}/UsagePoint/2/ElectricPowerUsageSummary"/>
    <content>
      <espi:UsagePoint>
        <espi:ServiceCategory>
          <espi:kind>0</espi:kind>
        </espi:ServiceCategory>
      </espi:UsagePoint>
    </content>
  </entry>
</feed>`;

interface BillingPeriod {
  bill: number
  billToDate: number
  consumption: number
  currentConsumption: number
  duration: number
  label: string
  start: number
}

// Jan 2025: 31 days = 2678400s, start = 1735689600 (2025-01-01T00:00:00Z)
// Feb 2025: 28 days = 2419200s, start = 1738368000 (2025-02-01T00:00:00Z)
// Mar 2025: 31 days = 2678400s, start = 1740787200 (2025-03-01T00:00:00Z)

const residentialPeriods: BillingPeriod[] = [
  { bill: 9245, billToDate: 9245, consumption: 680000, currentConsumption: 710000, duration: 2678400, label: 'January 2025', start: 1735689600 },
  { bill: 7830, billToDate: 17075, consumption: 520000, currentConsumption: 490000, duration: 2419200, label: 'February 2025', start: 1738368000 },
  { bill: 8520, billToDate: 25595, consumption: 610000, currentConsumption: 640000, duration: 2678400, label: 'March 2025', start: 1740787200 },
];

const solarPeriods: BillingPeriod[] = [
  { bill: 0, billToDate: 0, consumption: 420000, currentConsumption: 380000, duration: 2678400, label: 'January 2025', start: 1735689600 },
  { bill: 0, billToDate: 0, consumption: 310000, currentConsumption: 350000, duration: 2419200, label: 'February 2025', start: 1738368000 },
  { bill: 0, billToDate: 0, consumption: 480000, currentConsumption: 520000, duration: 2678400, label: 'March 2025', start: 1740787200 },
];

export const buildSummaryXml = (meterId: string): string => {
  const isSolar = meterId === '2';
  const meterLabel = isSolar ? 'Solar Generation' : 'Residential Meter';
  const periods = isSolar ? solarPeriods : residentialPeriods;

  const entries = periods.map((p, i) => `
  <entry>
    <id>urn:uuid:summary-${meterId}-${i + 1}</id>
    <title>${meterLabel} - ${p.label}</title>
    <published>2025-03-01T00:00:00Z</published>
    <updated>2025-03-01T00:00:00Z</updated>
    <link rel="self" href="${BASE_PATH}/UsagePoint/${meterId}/ElectricPowerUsageSummary/${i + 1}"/>
    <link rel="up" href="${BASE_PATH}/UsagePoint/${meterId}/ElectricPowerUsageSummary"/>
    <content>
      <espi:ElectricPowerUsageSummary>
        <espi:billingPeriod>
          <espi:duration>${p.duration}</espi:duration>
          <espi:start>${p.start}</espi:start>
        </espi:billingPeriod>
        <espi:billLastPeriod>${p.bill}</espi:billLastPeriod>
        <espi:billToDate>${p.billToDate}</espi:billToDate>
        <espi:overallConsumptionLastPeriod>
          <espi:powerOfTenMultiplier>0</espi:powerOfTenMultiplier>
          <espi:uom>72</espi:uom>
          <espi:value>${p.consumption}</espi:value>
        </espi:overallConsumptionLastPeriod>
        <espi:currentBillingPeriodOverAllConsumption>
          <espi:powerOfTenMultiplier>0</espi:powerOfTenMultiplier>
          <espi:uom>72</espi:uom>
          <espi:value>${p.currentConsumption}</espi:value>
        </espi:currentBillingPeriodOverAllConsumption>
      </espi:ElectricPowerUsageSummary>
    </content>
  </entry>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom"
      xmlns:espi="http://naesb.org/espi">
  <id>urn:uuid:mock-feed-summary-${meterId}</id>
  <title>${meterLabel} - Electric Power Usage Summary</title>
  <updated>2025-03-01T00:00:00Z</updated>
${entries}
</feed>`;
};
