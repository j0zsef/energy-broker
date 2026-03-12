import '../types/session.js';
import * as oidcClient from 'openid-client';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import { getOidcConfig } from '../config/oidc-config.js';

async function sessionAuthPlugin(fastify: FastifyInstance) {
  fastify.decorate('requireSession', () => {
    return async (request: FastifyRequest, reply: FastifyReply) => {
      const userId = request.session.get('userId');
      if (!userId) {
        return reply.status(401).send({ error: 'Not authenticated' });
      }

      // Check if token is expired and attempt refresh
      const expiresAt = request.session.get('expiresAt');
      if (expiresAt && Date.now() > expiresAt) {
        const refreshToken = request.session.get('refreshToken');
        if (!refreshToken) {
          return reply.status(401).send({ error: 'Session expired' });
        }

        try {
          const config = await getOidcConfig();
          const tokens = await oidcClient.refreshTokenGrant(config, refreshToken);

          request.session.set('accessToken', tokens.access_token);
          if (tokens.refresh_token) {
            request.session.set('refreshToken', tokens.refresh_token);
          }
          const expiresIn = tokens.expiresIn();
          if (expiresIn) {
            request.session.set('expiresAt', Date.now() + expiresIn * 1000);
          }
          await request.session.save();
        }
        catch (error) {
          fastify.log.error(error, 'Failed to refresh token');
          return reply.status(401).send({ error: 'Session expired' });
        }
      }

      // Set request.user for backward compatibility
      (request as unknown as { user: { sub: string } }).user = { sub: userId };
    };
  });
}

export default fp(sessionAuthPlugin, { name: 'session-auth' });
