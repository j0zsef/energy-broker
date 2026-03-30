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

  fastify.withTypeProvider<ZodTypeProvider>().get('/', opts, async (request) => {
    const { country, type } = request.query;

    const result = await patchClient.retrieveProjects({ country, type });
    return result;
  });
};

export default projects;
