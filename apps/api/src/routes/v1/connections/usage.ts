import '../../../types/session.js';
import { FastifyInstance } from 'fastify';
import { GreenButtonFactory } from '@energy-broker/green-button-client';
import { GreenButtonUsageRequest } from '@energy-broker/shared';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { prismaClient } from '../../../utils/prisma-client.js';
import z from 'zod';

const usage = async (fastify: FastifyInstance) => {
  const opts = {
    preHandler: fastify.requireSession(),
    schema: {
      params: z.object({
        connectionId: z.string(),
      }),
      querystring: z.object({
        max: z.string().date().optional(),
        min: z.string().date().optional(),
      }),
    },
  };

  fastify.withTypeProvider<ZodTypeProvider>().get('/:connectionId/usage', opts,
    async function (request, reply) {
      const userId = request.user.sub;
      const connectionId = Number(request.params.connectionId);

      const connection = await prismaClient.energyProviderConnection.findFirst({
        where: { id: connectionId, userId },
      });

      if (!connection) {
        return reply.status(404).send({ error: 'Connection not found' });
      }

      const usagePointRequest: GreenButtonUsageRequest = {
        max: request.query.max,
        min: request.query.min,
      };

      const greenButtonService = GreenButtonFactory.create('generic', connection.resourceUri);
      const usagePoints = await greenButtonService.fetchUsagePoints(connection.authToken, usagePointRequest);

      return { usagePoints };
    });
};

export default usage;
