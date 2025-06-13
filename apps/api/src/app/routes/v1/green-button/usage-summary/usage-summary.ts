import { Envs } from '../../../../app';
import { FastifyInstance } from 'fastify';
import { GreenButtonFactory } from '@green-button-client';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import z from 'zod';

export default async function (fastify: FastifyInstance) {
  const opts = {
    schema: {
      params: z.object({
        meterId: z.string(),
      }),
      querystring: z.object({
        max: z.string().date().optional(),
        min: z.string().date().optional(),
      }),
    },
  };

  fastify.withTypeProvider<ZodTypeProvider>().get('/:meterId', opts, async function (request) {
    // const user = request.user; // Retrieved from Auth0 JWT
    const summaryRequest = {
      max: request.query.max,
      meterId: request.params.meterId,
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
    const summary = await greenButtonService.fetchSummary(token, summaryRequest);

    return { summary };
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

      // Use baseUrl, provider, and accessToken to interact with Green Button
      const greenButtonService = GreenButtonFactory.create(provider, baseUrl);
      const summary = await greenButtonService.fetchSummary(accessToken, {
        max: request.query.max,
        min: request.query.min,
        meterId: request.params.meterId,
      });

      return { summary };
    } catch (err) {
      return reply.status(401).send({ error: 'Invalid or expired token' });
    }
  });
 */
