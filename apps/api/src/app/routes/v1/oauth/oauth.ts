import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { prismaClient } from '@backend';
import z from 'zod';

export default async function (fastify: FastifyInstance) {
  const opts = {
    schema: {
      params: z.object({
        provider: z.string(),
      }),
    },
  };

  fastify.withTypeProvider<ZodTypeProvider>().post('/:provider', opts, async function (request, reply) {
    /*
    TODO
      - The endpoint generates the OAuth authorization URL (with state, scopes, etc.) and any required tokens.
     */

    const provider = request.params.provider;

    const config = await prismaClient.oAuthProviderConfig.findUnique({
      where: { providerName: provider },
    });
    if (!config) return reply.status(404).send({ error: 'Not found' });

    return {
      authUrl: config.authUrl,
      clientId: config.clientId,
      redirectUri: config.redirectUri,
    };
  });
}
