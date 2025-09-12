import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { prismaClient } from '@backend';
import z from 'zod';

export default async function (fastify: FastifyInstance) {
  fastify.withTypeProvider<ZodTypeProvider>().get('/config/:id', {
    schema: {
      params: z.object({
        id: z.coerce.number(), // Use number if your ID is an integer
      }),
    },
  }, async (request, reply) => {
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
}
