import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import Fastify from 'fastify';

jest.mock('../../../utils/prisma-client.js', () => ({
  prismaClient: {
    energyProviderConnection: {
      findFirst: jest.fn(),
    },
  },
}));

jest.mock('@energy-broker/green-button-client', () => ({
  GreenButtonFactory: {
    create: jest.fn(),
  },
}));

import { GreenButtonFactory } from '@energy-broker/green-button-client';
import { prismaClient } from '../../../utils/prisma-client.js';
import summaryRoute from './summary.js';

const mockFindFirst = prismaClient.energyProviderConnection.findFirst as jest.Mock;
const mockCreate = GreenButtonFactory.create as jest.Mock;

function buildApp() {
  const app = Fastify({ logger: false });
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  app.decorate('requireSession', () => {
    return async (request: unknown) => {
      (request as { user: { sub: string } }).user = { sub: 'user-123' };
    };
  });
  app.register(summaryRoute, { prefix: '/connections' });
  return app;
}

afterEach(() => {
  jest.clearAllMocks();
});

describe('GET /connections/:connectionId/summary/meters/:meterId', () => {
  it('returns 404 when connection is not found', async () => {
    mockFindFirst.mockResolvedValue(null);
    const app = buildApp();

    const res = await app.inject({
      method: 'GET',
      url: '/connections/1/summary/meters/m1',
    });

    expect(res.statusCode).toBe(404);
    expect(res.json()).toEqual({ error: 'Connection not found' });
  });

  it('returns 410 when connection is expired', async () => {
    mockFindFirst.mockResolvedValue({
      authToken: 'token',
      expiresAt: new Date('2020-01-01'),
      id: 1,
      resourceUri: 'https://example.com',
      userId: 'user-123',
    });
    const app = buildApp();

    const res = await app.inject({
      method: 'GET',
      url: '/connections/1/summary/meters/m1',
    });

    expect(res.statusCode).toBe(410);
    expect(res.json()).toEqual({ error: 'Connection expired' });
  });

  it('returns summary data on success', async () => {
    const summaryData = [{ content: { ElectricPowerUsageSummary: { billLastPeriod: 9245 } } }];
    mockFindFirst.mockResolvedValue({
      authToken: 'token',
      expiresAt: new Date('2099-01-01'),
      id: 1,
      resourceUri: 'https://example.com',
      userId: 'user-123',
    });
    mockCreate.mockReturnValue({
      fetchSummary: jest.fn().mockResolvedValue(summaryData),
    });
    const app = buildApp();

    const res = await app.inject({
      method: 'GET',
      url: '/connections/1/summary/meters/m1',
    });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual(summaryData);
  });

  it('returns 502 when the provider throws', async () => {
    mockFindFirst.mockResolvedValue({
      authToken: 'token',
      expiresAt: new Date('2099-01-01'),
      id: 1,
      resourceUri: 'https://example.com',
      userId: 'user-123',
    });
    mockCreate.mockReturnValue({
      fetchSummary: jest.fn().mockRejectedValue(new Error('Provider down')),
    });
    const app = buildApp();

    const res = await app.inject({
      method: 'GET',
      url: '/connections/1/summary/meters/m1',
    });

    expect(res.statusCode).toBe(502);
    expect(res.json()).toEqual({ error: 'Failed to fetch summary from energy provider' });
  });
});
