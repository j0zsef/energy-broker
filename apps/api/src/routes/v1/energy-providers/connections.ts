import { FastifyInstance } from 'fastify';
import { prismaClient } from '../../../prisma-client';

const connections = async (fastify: FastifyInstance) => {
  fastify.get('/connections', { preHandler: fastify.requireAuth() },
    async function (request, reply) {
      try {
        const userId = request.user.sub;

        const authRecords = await prismaClient.energyProviderConnection.findMany({
          include: {
            energyProvider: true,
          },
          where: { userId },
        });

        if (!authRecords) return reply.status(404).send({ error: 'Not found' });

        return reply.status(200).send(authRecords);
      }
      catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({
          error: 'Failed to fetch energy provider auth',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    });
};

export default connections;
