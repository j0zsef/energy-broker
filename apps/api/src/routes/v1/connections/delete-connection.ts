import '../../../types/session.js';
import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { prismaClient } from '../../../utils/prisma-client.js';
import z from 'zod';

const deleteConnection = async (fastify: FastifyInstance) => {
  const opts = {
    preHandler: fastify.requireSession(),
    schema: {
      params: z.object({
        connectionId: z.string(),
      }),
    },
  };

  fastify.withTypeProvider<ZodTypeProvider>().delete('/:connectionId', opts,
    async function (request, reply) {
      const userId = request.user.sub;
      const connectionId = Number(request.params.connectionId);

      const connection = await prismaClient.energyProviderConnection.findFirst({
        where: { id: connectionId, userId },
      });

      if (!connection) {
        return reply.status(404).send({ error: 'Connection not found' });
      }

      await prismaClient.energyProviderConnection.delete({
        where: { id: connectionId },
      });

      return reply.status(200).send({ success: true });
    });
};

export default deleteConnection;
