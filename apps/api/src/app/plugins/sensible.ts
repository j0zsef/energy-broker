import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import sensible from '@fastify/sensible';

/**
 * This plugins adds some utilities to handle http errors
 * Defaults for Fastify that everyone can agree on
 * @see https://github.com/fastify/fastify-sensible
 */
export default fp(async function (fastify: FastifyInstance) {
  fastify.register(sensible);
});
