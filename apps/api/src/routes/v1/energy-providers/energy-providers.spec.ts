import Fastify from 'fastify';

jest.mock('../../../utils/prisma-client.js', () => ({
  prismaClient: {
    energyProvider: {
      findMany: jest.fn(),
    },
  },
}));

import energyProvidersRoute from './energy-providers.js';
import { prismaClient } from '../../../utils/prisma-client.js';

const mockFindMany = prismaClient.energyProvider.findMany as jest.Mock;

function buildApp() {
  const app = Fastify({ logger: false });
  app.decorate('requireSession', () => {
    return async (request: unknown) => {
      (request as { user: { sub: string } }).user = { sub: 'user-123' };
    };
  });
  app.register(energyProvidersRoute, { prefix: '/energy-providers' });
  return app;
}

afterEach(() => {
  jest.clearAllMocks();
});

describe('GET /energy-providers', () => {
  it('returns providers with flattened zips', async () => {
    mockFindMany.mockResolvedValue([
      {
        energyProviderLocations: [{ zip: '90210' }, { zip: '90211' }],
        fullName: 'Acme Electric Co',
        id: 1,
        name: 'acme',
        oAuthProviderConfig: { authUrl: 'https://auth.example.com', clientId: 'cid', id: 10 },
        oAuthProviderConfigId: 10,
        type: 'electrical',
      },
    ]);
    const app = buildApp();

    const res = await app.inject({
      method: 'GET',
      url: '/energy-providers',
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body).toHaveLength(1);
    expect(body[0].zips).toEqual(['90210', '90211']);
    expect(body[0].fullName).toBe('Acme Electric Co');
    expect(body[0]).not.toHaveProperty('energyProviderLocations');
  });

  it('returns 500 when the database throws', async () => {
    mockFindMany.mockRejectedValue(new Error('DB connection failed'));
    const app = buildApp();

    const res = await app.inject({
      method: 'GET',
      url: '/energy-providers',
    });

    expect(res.statusCode).toBe(500);
    expect(res.json()).toEqual({ error: 'Failed to fetch energy providers' });
  });
});
