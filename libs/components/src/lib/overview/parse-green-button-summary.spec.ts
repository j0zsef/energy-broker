import { GreenButtonSummary, ParsedSummary } from '@energy-broker/shared';
import { parseGreenButtonSummary } from './parse-green-button-summary';
import { filterByPeriod, filterPreviousPeriod, pctChange } from './use-energy-dashboard';

describe('parseGreenButtonSummary', () => {
  const baseSummary: GreenButtonSummary = {
    content: {
      ElectricPowerUsageSummary: {
        billLastPeriod: 9245,
        billingPeriod: { duration: 2678400, start: 1735689600 }, // 2025-01-01
        overallConsumptionLastPeriod: {
          powerOfTenMultiplier: 0,
          uom: 72,
          value: 680000,
        },
      },
    },
    published: '2025-03-01T00:00:00Z',
  };

  it('parses a valid summary with all fields', () => {
    const result = parseGreenButtonSummary(baseSummary, 1);

    expect(result).toEqual({
      connectionId: 1,
      consumptionKwh: 680,
      costDollars: 92.45,
      date: new Date(1735689600 * 1000),
    });
  });

  it('returns null when ElectricPowerUsageSummary is missing', () => {
    const empty: GreenButtonSummary = { content: {} };
    expect(parseGreenButtonSummary(empty, 1)).toBeNull();
  });

  it('returns null when content is missing', () => {
    const noContent: GreenButtonSummary = {};
    expect(parseGreenButtonSummary(noContent, 1)).toBeNull();
  });

  it('applies powerOfTenMultiplier correctly', () => {
    const summary: GreenButtonSummary = {
      content: {
        ElectricPowerUsageSummary: {
          billLastPeriod: 0,
          billingPeriod: { start: 1735689600 },
          overallConsumptionLastPeriod: {
            powerOfTenMultiplier: 3,
            value: 680,
          },
        },
      },
    };
    const result = parseGreenButtonSummary(summary, 1);
    // 680 * 10^3 = 680000 Wh = 680 kWh
    expect(result!.consumptionKwh).toBe(680);
  });

  it('falls back to published date when billingPeriod.start is missing', () => {
    const summary: GreenButtonSummary = {
      content: {
        ElectricPowerUsageSummary: {
          billLastPeriod: 100,
          overallConsumptionLastPeriod: { value: 1000 },
        },
      },
      published: '2025-02-15T00:00:00Z',
    };
    const result = parseGreenButtonSummary(summary, 1);
    expect(result!.date).toEqual(new Date('2025-02-15T00:00:00Z'));
  });

  it('defaults cost to 0 when billLastPeriod is missing', () => {
    const summary: GreenButtonSummary = {
      content: {
        ElectricPowerUsageSummary: {
          billingPeriod: { start: 1735689600 },
          overallConsumptionLastPeriod: { value: 1000 },
        },
      },
    };
    const result = parseGreenButtonSummary(summary, 1);
    expect(result!.costDollars).toBe(0);
  });
});


describe('filterByPeriod', () => {
  const entries: ParsedSummary[] = [
    { connectionId: 1, connectionLabel: 'C', consumptionKwh: 100, costDollars: 10, date: new Date('2025-01-01'), meterTitle: 'M' },
    { connectionId: 1, connectionLabel: 'C', consumptionKwh: 200, costDollars: 20, date: new Date('2025-02-01'), meterTitle: 'M' },
    { connectionId: 1, connectionLabel: 'C', consumptionKwh: 300, costDollars: 30, date: new Date('2025-03-01'), meterTitle: 'M' },
    { connectionId: 1, connectionLabel: 'C', consumptionKwh: 400, costDollars: 40, date: new Date('2025-04-01'), meterTitle: 'M' },
  ];

  it('returns 1 entry for 1m, sorted most recent first', () => {
    const result = filterByPeriod(entries, '1m');
    expect(result).toHaveLength(1);
    expect(result[0].date).toEqual(new Date('2025-04-01'));
  });

  it('returns 3 entries for 3m', () => {
    const result = filterByPeriod(entries, '3m');
    expect(result).toHaveLength(3);
    expect(result[0].date).toEqual(new Date('2025-04-01'));
    expect(result[2].date).toEqual(new Date('2025-02-01'));
  });

  it('returns all entries when period exceeds length', () => {
    const result = filterByPeriod(entries, '1y');
    expect(result).toHaveLength(4);
  });
});

describe('filterPreviousPeriod', () => {
  const entries: ParsedSummary[] = [
    { connectionId: 1, connectionLabel: 'C', consumptionKwh: 100, costDollars: 10, date: new Date('2025-01-01'), meterTitle: 'M' },
    { connectionId: 1, connectionLabel: 'C', consumptionKwh: 200, costDollars: 20, date: new Date('2025-02-01'), meterTitle: 'M' },
    { connectionId: 1, connectionLabel: 'C', consumptionKwh: 300, costDollars: 30, date: new Date('2025-03-01'), meterTitle: 'M' },
    { connectionId: 1, connectionLabel: 'C', consumptionKwh: 400, costDollars: 40, date: new Date('2025-04-01'), meterTitle: 'M' },
  ];

  it('returns the next N entries after the current period slice', () => {
    const result = filterPreviousPeriod(entries, '1m');
    expect(result).toHaveLength(1);
    expect(result[0].date).toEqual(new Date('2025-03-01'));
  });

  it('returns entries for 3m previous period', () => {
    const result = filterPreviousPeriod(entries, '3m');
    // Current period = [Apr, Mar, Feb], previous = [Jan]
    expect(result).toHaveLength(1);
    expect(result[0].date).toEqual(new Date('2025-01-01'));
  });
});

describe('pctChange', () => {
  it('calculates percentage change correctly', () => {
    expect(pctChange(150, 100)).toBe(50);
  });

  it('returns null when previous is zero', () => {
    expect(pctChange(100, 0)).toBeNull();
  });

  it('returns 0 when values are equal', () => {
    expect(pctChange(100, 100)).toBe(0);
  });

  it('handles negative change', () => {
    expect(pctChange(50, 100)).toBe(-50);
  });
});

