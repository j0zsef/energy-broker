import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import Fastify from 'fastify';

jest.mock('../../../utils/prisma-client.js', () => ({
  prismaClient: {
    carbonCreditOrder: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock('@energy-broker/patch-client', () => ({
  createPatchClient: jest.fn(() => ({
    createOrder: jest.fn(),
    placeOrder: jest.fn(),
  })),
}));

import { createPatchClient } from '@energy-broker/patch-client';
import ordersRoute from './orders.js';
import { prismaClient } from '../../../utils/prisma-client.js';

const mockFindMany = prismaClient.carbonCreditOrder.findMany as jest.Mock;
const mockCreate = prismaClient.carbonCreditOrder.create as jest.Mock;
const mockUpdate = prismaClient.carbonCreditOrder.update as jest.Mock;
const mockFindFirst = prismaClient.carbonCreditOrder.findFirst as jest.Mock;

// The route module calls createPatchClient once at import time — grab that instance.
const mockPatchClientInstance = (createPatchClient as jest.Mock).mock.results[0].value as { createOrder: jest.Mock, placeOrder: jest.Mock };
const mockCreateOrder = mockPatchClientInstance.createOrder;
const mockPlaceOrder = mockPatchClientInstance.placeOrder;

function buildApp() {
  const app = Fastify({ logger: false });
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  app.decorate('requireSession', () => {
    return async (request: unknown) => {
      (request as { user: { sub: string } }).user = { sub: 'user-123' };
    };
  });
  app.register(ordersRoute, { prefix: '/carbon/orders' });
  return app;
}

afterEach(() => {
  jest.clearAllMocks();
});

describe('GET /carbon/orders', () => {
  it('returns empty orders with zeroed totals when no orders exist', async () => {
    mockFindMany.mockResolvedValue([]);
    const app = buildApp();

    const res = await app.inject({
      method: 'GET',
      url: '/carbon/orders',
    });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ orders: [], totalOffsetMtCo2: 0, totalSpentCents: 0 });
  });

  it('returns orders with correct totals when orders exist', async () => {
    const createdAt = new Date('2024-06-01T00:00:00.000Z');
    mockFindMany.mockResolvedValue([
      {
        createdAt,
        id: 1,
        massGrams: 500_000,
        patchOrderId: 'patch-1',
        priceCents: 1500,
        projectName: 'Forest Project',
        projectType: 'reforestation',
        state: 'placed',
        vintageYear: 2023,
      },
      {
        createdAt,
        id: 2,
        massGrams: 1_500_000,
        patchOrderId: 'patch-2',
        priceCents: 4500,
        projectName: 'Solar Project',
        projectType: 'solar',
        state: 'placed',
        vintageYear: 2022,
      },
    ]);
    const app = buildApp();

    const res = await app.inject({
      method: 'GET',
      url: '/carbon/orders',
    });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({
      orders: [
        {
          createdAt: createdAt.toISOString(),
          id: 1,
          massGrams: 500_000,
          patchOrderId: 'patch-1',
          priceCents: 1500,
          projectName: 'Forest Project',
          projectType: 'reforestation',
          state: 'placed',
          vintageYear: 2023,
        },
        {
          createdAt: createdAt.toISOString(),
          id: 2,
          massGrams: 1_500_000,
          patchOrderId: 'patch-2',
          priceCents: 4500,
          projectName: 'Solar Project',
          projectType: 'solar',
          state: 'placed',
          vintageYear: 2022,
        },
      ],
      totalOffsetMtCo2: 2,
      totalSpentCents: 6000,
    });
  });
});

describe('POST /carbon/orders/create', () => {
  it('returns checkoutUrl on success with return_url containing orderId', async () => {
    mockCreate.mockResolvedValue({ id: 42, massGrams: 1_000_000, patchOrderId: null, priceCents: 0, projectId: 'proj-1', state: 'draft', userId: 'user-123' });
    mockCreateOrder.mockResolvedValue({ checkoutUrl: 'https://checkout.patch.io/orders/patch-ord-1?return_url=...', id: 'patch-ord-1', priceCents: 3000 });
    mockUpdate.mockResolvedValue({});
    const app = buildApp();

    const res = await app.inject({
      body: { massGrams: 1_000_000, projectId: 'proj-1' },
      method: 'POST',
      url: '/carbon/orders/create',
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body).toHaveProperty('checkoutUrl');

    const createOrderCall = mockCreateOrder.mock.calls[0];
    const returnUrl: string = createOrderCall[2];
    expect(returnUrl).toContain('orderId=42');
  });

  it('returns 400 when body is invalid (missing massGrams)', async () => {
    const app = buildApp();

    const res = await app.inject({
      body: { projectId: 'proj-1' },
      method: 'POST',
      url: '/carbon/orders/create',
    });

    expect(res.statusCode).toBe(400);
  });

  it('returns 500 when patchClient.createOrder throws', async () => {
    mockCreate.mockResolvedValue({ id: 99, massGrams: 1_000_000, patchOrderId: null, priceCents: 0, projectId: 'proj-1', state: 'draft', userId: 'user-123' });
    mockCreateOrder.mockRejectedValue(new Error('Patch API unavailable'));
    const app = buildApp();

    const res = await app.inject({
      body: { massGrams: 1_000_000, projectId: 'proj-1' },
      method: 'POST',
      url: '/carbon/orders/create',
    });

    expect(res.statusCode).toBe(500);
  });
});

describe('PATCH /carbon/orders/:id/place', () => {
  it('returns 404 when order not found', async () => {
    mockFindFirst.mockResolvedValue(null);
    const app = buildApp();

    const res = await app.inject({
      method: 'PATCH',
      url: '/carbon/orders/1/place',
    });

    expect(res.statusCode).toBe(404);
    expect(res.json()).toEqual({ error: 'Order not found' });
  });

  it('returns 400 when order is already placed', async () => {
    mockFindFirst.mockResolvedValue({ id: 1, patchOrderId: 'patch-1', state: 'placed', userId: 'user-123' });
    const app = buildApp();

    const res = await app.inject({
      method: 'PATCH',
      url: '/carbon/orders/1/place',
    });

    expect(res.statusCode).toBe(400);
    expect(res.json()).toEqual({ error: 'Order already placed' });
  });

  it('returns 400 when patchOrderId is null (not fully initialized)', async () => {
    mockFindFirst.mockResolvedValue({ id: 1, patchOrderId: null, state: 'draft', userId: 'user-123' });
    const app = buildApp();

    const res = await app.inject({
      method: 'PATCH',
      url: '/carbon/orders/1/place',
    });

    expect(res.statusCode).toBe(400);
    expect(res.json()).toEqual({ error: 'Order not fully initialized' });
  });

  it('returns the placed order on success', async () => {
    const createdAt = new Date('2024-06-15T00:00:00.000Z');
    mockFindFirst.mockResolvedValue({ id: 1, patchOrderId: 'patch-ord-1', priceCents: 3000, state: 'draft', userId: 'user-123' });
    mockPlaceOrder.mockResolvedValue({ id: 'patch-ord-1', priceCents: 3200, state: 'placed' });
    mockUpdate.mockResolvedValue({
      createdAt,
      id: 1,
      massGrams: 1_000_000,
      patchOrderId: 'patch-ord-1',
      priceCents: 3200,
      projectName: 'Forest Project',
      projectType: 'reforestation',
      state: 'placed',
      vintageYear: 2023,
    });
    const app = buildApp();

    const res = await app.inject({
      method: 'PATCH',
      url: '/carbon/orders/1/place',
    });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({
      createdAt: createdAt.toISOString(),
      id: 1,
      massGrams: 1_000_000,
      patchOrderId: 'patch-ord-1',
      priceCents: 3200,
      projectName: 'Forest Project',
      projectType: 'reforestation',
      state: 'placed',
      vintageYear: 2023,
    });
  });
});
