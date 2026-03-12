import '../../../types/session.js';
import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { prismaClient } from '../../../utils/prisma-client.js';
import z from 'zod';

const callbackQuerySchema = z.object({
  code: z.string(),
  state: z.string(),
});

const oauthCallback = async (fastify: FastifyInstance) => {
  const opts = {
    preHandler: fastify.requireSession(),
    schema: {
      querystring: callbackQuerySchema,
    },
  };

  fastify.withTypeProvider<ZodTypeProvider>().get('/callback', opts, async (request, reply) => {
    const { code, state } = request.query;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:9200';

    // Validate state
    const expectedState = request.session.get('oauthState');
    if (!expectedState || state !== expectedState) {
      return reply.redirect(`${frontendUrl}/connections?error=state_mismatch`);
    }

    const energyProviderId = request.session.get('oauthEnergyProviderId');
    if (!energyProviderId) {
      return reply.redirect(`${frontendUrl}/connections?error=missing_provider`);
    }

    // Look up provider config
    const provider = await prismaClient.energyProvider.findUnique({
      include: { oAuthProviderConfig: true },
      where: { id: energyProviderId },
    });

    if (!provider) {
      return reply.redirect(`${frontendUrl}/connections?error=provider_not_found`);
    }

    const oauthConfig = provider.oAuthProviderConfig;
    const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:9400';

    try {
      // Exchange code for tokens server-side
      const tokenResponse = await fetch(oauthConfig.tokenUrl, {
        body: JSON.stringify({
          client_id: oauthConfig.clientId,
          code,
          grant_type: 'authorization_code',
          redirect_uri: `${apiBaseUrl}/v1/energy-providers/callback`,
        }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });

      if (!tokenResponse.ok) {
        fastify.log.error('Token exchange failed: %s', await tokenResponse.text());
        return reply.redirect(`${frontendUrl}/connections?error=token_exchange_failed`);
      }

      const tokenData = await tokenResponse.json() as {
        access_token: string
        expires_in: number
        refresh_token: string
        resourceURI: string
      };

      const userId = request.session.get('userId');
      if (!userId) {
        return reply.redirect(`${frontendUrl}/connections?error=not_authenticated`);
      }

      // Save connection to DB
      await prismaClient.energyProviderConnection.create({
        data: {
          authToken: tokenData.access_token,
          energyProviderId,
          expiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
          refreshToken: tokenData.refresh_token,
          resourceUri: tokenData.resourceURI,
          userId,
        },
      });

      // Clear OAuth state from session
      request.session.set('oauthState', undefined);
      request.session.set('oauthEnergyProviderId', undefined);
      await request.session.save();

      return reply.redirect(`${frontendUrl}/connections`);
    }
    catch (error) {
      fastify.log.error(error, 'Provider OAuth callback failed');
      return reply.redirect(`${frontendUrl}/connections?error=callback_failed`);
    }
  });
};

export default oauthCallback;
