import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { prismaClient } from '../../../utils/prisma-client.js';
import z from 'zod';

const connectionSchema = z.object({
  authToken: z.string().min(1),
  energyProviderId: z.number().int().positive(),
  expiresAt: z.coerce.date(),
  refreshToken: z.string().min(1),
  resourceUri: z.string().url(),
});

const connection = async (fastify: FastifyInstance) => {
  const opts = {
    preHandler: fastify.requireSession(),
    schema: {
      body: connectionSchema,
    },
  };

  fastify.withTypeProvider<ZodTypeProvider>().post('/connection', opts, async function (request, reply) {
    try {
      const userId = request.user.sub;
      const data = request.body;

      await prismaClient.energyProviderConnection.create({
        data: {
          ...data,
          userId,
        },
      });

      return reply.status(201).send({ success: true });
    }
    catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        error: 'Failed to save energy provider connection',
      });
    }
  });
};

export default connection;
