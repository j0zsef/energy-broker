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
    - The Fastify endpoint looks up the OAuth config (client ID, secret, redirect URI, etc.) in your DB.
      - The endpoint generates the OAuth authorization URL (with state, scopes, etc.) and any required tokens.
      - The endpoint responds with the redirect URL.
     */

    const provider = request.params.provider;

    const config = await prismaClient.oAuthProviderConfig.findUnique({
      where: { providerName: provider },
    });
    if (!config) return reply.status(404).send({ error: 'Not found' });

    return {
      redirectUrl: config.redirectUri,
    };
  });
}
