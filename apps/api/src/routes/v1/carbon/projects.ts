import '../../../types/session.js';
import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { createPatchClient } from '@energy-broker/patch-client';
import z from 'zod';

const patchClient = createPatchClient(process.env.PATCH_API_KEY ?? '');

const projects = async (fastify: FastifyInstance) => {
  const opts = {
    preHandler: fastify.requireSession(),
    schema: {
      querystring: z.object({
        country: z.string().optional(),
        type: z.string().optional(),
      }),
    },
  };

  fastify.withTypeProvider<ZodTypeProvider>().get('/projects', opts, async (request, reply) => {
    const { country, type } = request.query;

    try {
      const result = await patchClient.retrieveProjects({ country, type });
      return result;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch projects';
      const isAuthError = message.toLowerCase().includes('unknown organization')
        || message.toLowerCase().includes('401')
        || message.toLowerCase().includes('unauthorized');

      return reply.status(isAuthError ? 503 : 502).send({
        error: isAuthError
          ? 'Carbon offset service is not configured. Check PATCH_API_KEY.'
          : `Carbon offset service error: ${message}`,
      });
    }
  });
};

export default projects;
