import '../../../types/session.js';
import * as oidcClient from 'openid-client';
import { FastifyInstance } from 'fastify';
import { getOidcConfig } from '../../../config/oidc-config.js';

const login = async (fastify: FastifyInstance) => {
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
};

export default login;
