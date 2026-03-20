import { FastifyInstance } from 'fastify';
import { prismaClient } from '../../../utils/prisma-client.js';

const connections = async (fastify: FastifyInstance) => {
  fastify.get('/connections', { preHandler: fastify.requireSession() },
    async function (request, reply) {
      try {
        const userId = request.user.sub;

        const authRecords = await prismaClient.energyProviderConnection.findMany({
          include: {
            energyProvider: true,
          },
          where: { userId },
        });

        return reply.status(200).send(authRecords);
      }
      catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({
          error: 'Failed to fetch energy provider connections',
        });
      }
    });
};

export default connections;
