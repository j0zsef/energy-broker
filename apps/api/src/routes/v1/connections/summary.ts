import { Envs } from '../../../app';
import { FastifyInstance } from 'fastify';
import { GreenButtonFactory } from '@energy-broker/green-button-client';
import { GreenButtonSummaryRequest } from '@energy-broker/shared';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import z from 'zod';

const summary = async (fastify: FastifyInstance) => {
  const opts = {
    preHandler: fastify.requireAuth(),
    schema: {
      params: z.object({
        connectionId: z.string(),
        meterId: z.string(),
      }),
      querystring: z.object({
        max: z.string().date().optional(),
        min: z.string().date().optional(),
      }),
    },
  };

  fastify.withTypeProvider<ZodTypeProvider>().get('/:connectionId/summary/meters/:meterId', opts,
    async function (request) {
      // const user = request.user; // Retrieved from Auth0 JWT
      const summaryRequest: GreenButtonSummaryRequest = {
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

export default summary;
