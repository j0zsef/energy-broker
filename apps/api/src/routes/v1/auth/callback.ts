import '../../../types/session.js';
import * as oidcClient from 'openid-client';
import { FastifyInstance } from 'fastify';
import { getOidcConfig } from '../../../config/oidc-config.js';

const callback = async (fastify: FastifyInstance) => {
  fastify.get('/callback', async (request, reply) => {
    try {
      const config = await getOidcConfig();
      const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:9400';
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:9200';
      const currentUrl = new URL(request.url, apiBaseUrl);

      const expectedState = request.session.get('oauthState');
      const codeVerifier = request.session.get('codeVerifier');

      const tokens = await oidcClient.authorizationCodeGrant(config, currentUrl, {
        expectedState,
        pkceCodeVerifier: codeVerifier,
      });

      const claims = tokens.claims();

      // Regenerate session to prevent fixation
      await request.session.regenerate(['cookie']);

      request.session.set('accessToken', tokens.access_token);
      request.session.set('refreshToken', tokens.refresh_token);
      request.session.set('userId', claims?.sub);
      request.session.set('email', claims?.email as string | undefined);
      request.session.set('name', claims?.name as string | undefined);
      request.session.set('picture', claims?.picture as string | undefined);

      const expiresIn = tokens.expiresIn();
      if (expiresIn) {
        request.session.set('expiresAt', Date.now() + expiresIn * 1000);
      }

      await request.session.save();

      return reply.redirect(frontendUrl);
    }
    catch (error) {
      fastify.log.error(error);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:9200';
      return reply.redirect(`${frontendUrl}?error=auth_failed`);
    }
  });
};

export default callback;
