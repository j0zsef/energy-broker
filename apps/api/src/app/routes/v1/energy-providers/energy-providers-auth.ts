import { EnergyProviderAuth } from '@shared';
import { FastifyInstance } from 'fastify';
import { prismaClient } from '@backend';

export default async function (fastify: FastifyInstance) {
  fastify.post('/auth', async function (request, reply) {
    try {
      const authData = request.body as EnergyProviderAuth;

      await prismaClient.energyProviderAuth.create({
        data: authData,
      });

      return reply.status(201).send({ success: true });
    }
    catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        error: 'Failed to save energy provider auth',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });
}
