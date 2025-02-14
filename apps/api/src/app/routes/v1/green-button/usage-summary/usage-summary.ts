import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { GreenButtonFactory } from "@green-button-client";
import { Envs } from "../../../../app";

export default async function (fastify: FastifyInstance) {
  const opts = {
    schema: {
      params: z.object({
        meterId: z.string(),
      }),
      querystring: z.object({
        min: z.string().date().optional(),
        max: z.string().date().optional(),
      }),
    },
  }

  fastify.withTypeProvider<ZodTypeProvider>().get('/:meterId', opts, async function (request) {
    //const user = request.user; // Retrieved from Auth0 JWT
    const summaryRequest = {
      min: request.query.min,
      max: request.query.max,
      meterId: request.params.meterId,
    }

    // should be able to figure this out from the auth process
    const provider = "generic";
    // we should be getting the base URL from the auth process: resourceURI. something like:
    // https://utilityapi.com/DataCustodian/espi/1_1/resource/Subscription/1111
    const baseUrl = "https://sandbox.greenbuttonalliance.org:8443/DataCustodian/";
    // we should be getting the token from registering with the provider
    const token = fastify.getEnvs<Envs>().GREEN_BUTTON_TOKEN;

    const greenButtonService = GreenButtonFactory.create(provider, baseUrl);
    const summary = await greenButtonService.fetchSummary(token, summaryRequest);

    return { summary };
  });
}
