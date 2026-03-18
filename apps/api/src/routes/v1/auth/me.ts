import '../../../types/session.js';
import { FastifyInstance } from 'fastify';

const me = async (fastify: FastifyInstance) => {
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

export default me;
