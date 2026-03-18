import '../../../types/session.js';
import { FastifyInstance } from 'fastify';

const logout = async (fastify: FastifyInstance) => {
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
};

export default logout;
