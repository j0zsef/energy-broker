import '../../../types/session.js';
import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { prismaClient } from '../../../utils/prisma-client.js';
import z from 'zod';

const authorizeSchema = z.object({
  energyProviderId: z.number().int().positive(),
});

const authorize = async (fastify: FastifyInstance) => {
  const opts = {
    preHandler: fastify.requireSession(),
    schema: {
      body: authorizeSchema,
    },
  };

  fastify.withTypeProvider<ZodTypeProvider>().post('/authorize', opts, async (request, reply) => {
    const { energyProviderId } = request.body;

    const provider = await prismaClient.energyProvider.findUnique({
      include: { oAuthProviderConfig: true },
      where: { id: energyProviderId },
    });

    if (!provider) {
      return reply.status(404).send({ error: 'Energy provider not found' });
    }

    const oauthConfig = provider.oAuthProviderConfig;
    const state = crypto.randomUUID();

    request.session.set('oauthState', state);
    request.session.set('oauthEnergyProviderId', energyProviderId);
    await request.session.save();

    const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:9400';

    const url = new URL(oauthConfig.authUrl);
    url.searchParams.set('client_id', oauthConfig.clientId);
    url.searchParams.set('redirect_uri', `${apiBaseUrl}/v1/energy-providers/callback`);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('state', state);

    return reply.send({ url: url.toString() });
  });
};

export default authorize;
