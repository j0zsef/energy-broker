import { Envs } from '../../../app';
import { FastifyInstance } from 'fastify';
import { GreenButtonFactory } from '@energy-broker/green-button-client';
import { GreenButtonUsageRequest } from '@energy-broker/shared';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import z from 'zod';

const usage = async (fastify: FastifyInstance) => {
  const opts = {
    preHandler: fastify.requireAuth(),
    schema: {
      params: z.object({
        connectionId: z.string(),
      }),
      querystring: z.object({
        max: z.string().date().optional(),
        min: z.string().date().optional(),
      }),
    },
  };

  // Level 1: Energy provider TYPE (electrical, gas, water)
  // Level 2: Energy provider IMPLEMENTATION (PG&E, SCE, Generic - all use Green Button)

  fastify.withTypeProvider<ZodTypeProvider>().get('/:connectionId/usage', opts,
    async function (request) {
      // const user = request.user; // Retrieved from Auth0 JWT
      const usagePointRequest: GreenButtonUsageRequest = {
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
};

export default usage;
