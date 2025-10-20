import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { prismaClient } from '@backend';
import z from 'zod';

export default async function (fastify: FastifyInstance) {
  const ops = {
    schema: {
      params: z.object({
        userId: z.coerce.string(),
      }),
    },
  };

  fastify.withTypeProvider<ZodTypeProvider>().get('/connections/:userId', ops,
    async function (request, reply) {
      try {
        const { userId } = request.params;

        const authRecords = await prismaClient.energyProviderConnection.findMany({
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
}
