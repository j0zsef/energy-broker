import '../../../types/session.js';
import { FastifyInstance } from 'fastify';
import { GRAMS_PER_METRIC_TON } from '@energy-broker/shared';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { createPatchClient } from '@energy-broker/patch-client';
import { prismaClient } from '../../../utils/prisma-client.js';
import z from 'zod';

const patchClient = createPatchClient(process.env.PATCH_API_KEY ?? '');

const orders = async (fastify: FastifyInstance) => {
  // GET /v1/carbon/orders — list user's orders with summary
  fastify.withTypeProvider<ZodTypeProvider>().get(
    '/orders',
    { preHandler: fastify.requireSession() },
    async (request) => {
      const userId = request.user.sub;

      const dbOrders = await prismaClient.carbonCreditOrder.findMany({
        orderBy: { createdAt: 'desc' },
        where: { userId },
      });

      let totalOffsetGrams = 0;
      let totalSpentCents = 0;

      const orders = dbOrders.map((o) => {
        totalOffsetGrams += o.massGrams;
        totalSpentCents += o.priceCents;

        return {
          createdAt: o.createdAt.toISOString(),
          id: o.id,
          massGrams: o.massGrams,
          patchOrderId: o.patchOrderId,
          priceCents: o.priceCents,
          projectName: o.projectName,
          projectType: o.projectType,
          state: o.state,
          vintageYear: o.vintageYear,
        };
      });

      return {
        orders,
        totalOffsetMtCo2: totalOffsetGrams / GRAMS_PER_METRIC_TON,
        totalSpentCents,
      };
    },
  );

  // POST /v1/carbon/orders/create — create draft order
  const createOpts = {
    preHandler: fastify.requireSession(),
    schema: {
      body: z.object({
        massGrams: z.number().int().positive(),
        projectId: z.string().min(1),
      }),
    },
  };

  fastify.withTypeProvider<ZodTypeProvider>().post('/orders/create', createOpts, async (request) => {
    const userId = request.user.sub;
    const { massGrams, projectId } = request.body;

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:9200';

    // Create the DB record first so we have its id for the return_url
    const dbOrder = await prismaClient.carbonCreditOrder.create({
      data: {
        massGrams,
        patchOrderId: null,
        priceCents: 0,
        projectId,
        state: 'draft',
        userId,
      },
    });

    const returnUrl = `${frontendUrl}/carbon-credits/success?orderId=${dbOrder.id}`;
    const patchOrder = await patchClient.createOrder(projectId, massGrams, returnUrl);

    // Write the Patch order id back to the DB record
    await prismaClient.carbonCreditOrder.update({
      data: {
        patchOrderId: patchOrder.id,
        priceCents: patchOrder.priceCents,
      },
      where: { id: dbOrder.id },
    });

    return { checkoutUrl: patchOrder.checkoutUrl };
  });

  // PATCH /v1/carbon/orders/:id/place — place a draft order after checkout
  const placeOpts = {
    preHandler: fastify.requireSession(),
    schema: {
      params: z.object({
        id: z.string(),
      }),
    },
  };

  fastify.withTypeProvider<ZodTypeProvider>().patch('/orders/:id/place', placeOpts, async (request, reply) => {
    const userId = request.user.sub;
    const orderId = Number(request.params.id);

    const dbOrder = await prismaClient.carbonCreditOrder.findFirst({
      where: { id: orderId, userId },
    });

    if (!dbOrder) {
      return reply.status(404).send({ error: 'Order not found' });
    }

    if (dbOrder.state !== 'draft') {
      return reply.status(400).send({ error: 'Order already placed' });
    }

    if (!dbOrder.patchOrderId) {
      return reply.status(400).send({ error: 'Order not fully initialized' });
    }

    const patchResult = await patchClient.placeOrder(dbOrder.patchOrderId);

    const updated = await prismaClient.carbonCreditOrder.update({
      data: {
        priceCents: patchResult.priceCents || dbOrder.priceCents,
        state: 'placed',
      },
      where: { id: orderId },
    });

    return {
      createdAt: updated.createdAt.toISOString(),
      id: updated.id,
      massGrams: updated.massGrams,
      patchOrderId: updated.patchOrderId,
      priceCents: updated.priceCents,
      projectName: updated.projectName,
      projectType: updated.projectType,
      state: updated.state,
      vintageYear: updated.vintageYear,
    };
  });
};

export default orders;
