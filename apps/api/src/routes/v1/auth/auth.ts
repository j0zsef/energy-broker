import '../../../types/session.js';
import * as oidcClient from 'openid-client';
import { FastifyInstance } from 'fastify';
import { getOidcConfig } from '../../../config/oidc-config.js';

const auth = async (fastify: FastifyInstance) => {
  // GET /v1/auth/login — initiate Auth0 authorization code flow
  fastify.get('/login', async (request, reply) => {
    const config = await getOidcConfig();
    const state = oidcClient.randomState();
    const codeVerifier = oidcClient.randomPKCECodeVerifier();
    const codeChallenge = await oidcClient.calculatePKCECodeChallenge(codeVerifier);

    request.session.set('oauthState', state);
    request.session.set('codeVerifier', codeVerifier);
    await request.session.save();

    const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:9400';

    const authUrl = oidcClient.buildAuthorizationUrl(config, {
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      redirect_uri: `${apiBaseUrl}/v1/auth/callback`,
      response_type: 'code',
      scope: 'openid profile email offline_access',
      state,
    });

    return reply.send({ url: authUrl.toString() });
  });

  // GET /v1/auth/callback — Auth0 redirects here with code + state
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

  // POST /v1/auth/logout — destroy session and return Auth0 logout URL
  fastify.post('/logout', async (request, reply) => {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:9200';
    const domain = process.env.AUTH0_DOMAIN || '';
    const clientId = process.env.AUTH0_CLIENT_ID || '';

    await request.session.destroy();

    const logoutUrl = new URL(`https://${domain}/v2/logout`);
    logoutUrl.searchParams.set('client_id', clientId);
    logoutUrl.searchParams.set('returnTo', frontendUrl);

    return reply.send({ url: logoutUrl.toString() });
  });

  // GET /v1/auth/me — return user info from session
  fastify.get('/me', async (request, reply) => {
    const userId = request.session.get('userId');
    if (!userId) {
      return reply.status(401).send({ error: 'Not authenticated' });
    }

    return reply.send({
      email: request.session.get('email'),
      name: request.session.get('name'),
      picture: request.session.get('picture'),
      userId,
    });
  });
};

export default auth;
