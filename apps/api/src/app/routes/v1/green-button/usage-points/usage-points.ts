import { Envs } from '../../../../app';
import { FastifyInstance } from 'fastify';
import { GreenButtonFactory } from '@green-button-client';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import z from 'zod';

export default async function (fastify: FastifyInstance) {
  const opts = {
    schema: {
      querystring: z.object({
        max: z.string().date().optional(),
        min: z.string().date().optional(),
      }),
    },
  };

  fastify.withTypeProvider<ZodTypeProvider>().get('/', opts, async function (request) {
    // const user = request.user; // Retrieved from Auth0 JWT
    const usagePointRequest = {
      max: request.query.max,
      min: request.query.min,
    };

    // should be able to figure this out from the auth process
    const provider = 'generic';
    // we should be getting the base URL from the auth process: resourceURI. something like:
    // https://utilityapi.com/DataCustodian/espi/1_1/resource/Subscription/1111
    const baseUrl = 'https://sandbox.greenbuttonalliance.org:8443/DataCustodian';
    // we should be getting the token from registering with the provider
    const token = fastify.getEnvs<Envs>().GREEN_BUTTON_TOKEN;

    const greenButtonService = GreenButtonFactory.create(provider, baseUrl);
    const usagePoints = await greenButtonService.fetchUsagePoints(token, usagePointRequest);

    return { usagePoints };
  });
}

/*
TODO: AUTH
const authHeader = request.headers.authorization;
    if (!authHeader) {
      return reply.status(401).send({ error: 'Authorization header missing' });
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.AUTH0_PUBLIC_KEY, {
        algorithms: ['RS256'],
      });

      const { baseUrl, provider, accessToken } = decoded as {
        baseUrl: string;
        provider: string;
        accessToken: string;
      };
    } catch (err) {
      return reply.status(401).send({ error: 'Invalid token' });
    }

 */
