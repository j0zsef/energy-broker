import { FastifyInstance } from 'fastify';
import { prismaClient } from '@backend';

export default async function (fastify: FastifyInstance) {
  fastify.get('/connections', async function (request, reply) {
    try {
      // TODO: Need to get userId from auth token/session
      const userId = 0; // Placeholder for authenticated user ID

      const authRecords = await prismaClient.energyProviderConnection.findMany({
        where: { userId },
      });

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
}
