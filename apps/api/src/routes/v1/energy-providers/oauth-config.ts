import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { prismaClient } from '../../../prisma-client.js';
import z from 'zod';

const oAuthConfig = async (fastify: FastifyInstance) => {
  const ops = {
    preHandler: fastify.requireAuth(),
    schema: {
      params: z.object({
        id: z.coerce.number(),
      }),
    },
  };

  fastify.withTypeProvider<ZodTypeProvider>().get('/oauth-config/:id', ops,
    async (request, reply) => {
      const { id } = request.params;
      const config = await prismaClient.oAuthProviderConfig.findUnique({
        where: { id },
      });
      if (!config) return reply.status(404).send({ error: 'Not found' });
      return {
        authUrl: config.authUrl,
        clientId: config.clientId,
        redirectUri: config.redirectUri,
        tokenUrl: config.tokenUrl,
      };
    });
};

export default oAuthConfig;
