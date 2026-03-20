import '../../../types/session.js';
import { FastifyInstance } from 'fastify';
import { GreenButtonFactory } from '@energy-broker/green-button-client';
import { GreenButtonSummaryRequest } from '@energy-broker/shared';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { prismaClient } from '../../../utils/prisma-client.js';
import z from 'zod';

const summary = async (fastify: FastifyInstance) => {
  const opts = {
    preHandler: fastify.requireSession(),
    schema: {
      params: z.object({
        connectionId: z.string(),
        meterId: z.string(),
      }),
      querystring: z.object({
        max: z.string().date().optional(),
        min: z.string().date().optional(),
      }),
    },
  };

  fastify.withTypeProvider<ZodTypeProvider>().get('/:connectionId/summary/meters/:meterId', opts,
    async function (request, reply) {
      const userId = request.user.sub;
      const connectionId = Number(request.params.connectionId);

      const connection = await prismaClient.energyProviderConnection.findFirst({
        where: { id: connectionId, userId },
      });

      if (!connection) {
        return reply.status(404).send({ error: 'Connection not found' });
      }

      if (connection.expiresAt < new Date()) {
        return reply.status(410).send({ error: 'Connection expired' });
      }

      const summaryRequest: GreenButtonSummaryRequest = {
        max: request.query.max,
        meterId: request.params.meterId,
        min: request.query.min,
      };

      try {
        const greenButtonService = GreenButtonFactory.create('generic', connection.resourceUri);
        const summaryData = await greenButtonService.fetchSummary(connection.authToken, summaryRequest);

        return summaryData;
      }
      catch (error) {
        fastify.log.error(error, 'Failed to fetch summary from provider (resourceUri: %s)', connection.resourceUri);
        return reply.status(502).send({ error: 'Failed to fetch summary from energy provider' });
      }
    });
};

export default summary;
