import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

export default async function (fastify: FastifyInstance) {
  const opts = {
    schema: {
      querystring: z.object({
        min: z.string().date().optional(),
        max: z.string().date().optional(),
      }),
    },
  }

  fastify.withTypeProvider<ZodTypeProvider>().get('/', opts, async function (request) {
    return { message: 'Hello Usage Summary' };
  });
}
