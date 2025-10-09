import { FastifyInstance } from 'fastify';
import { prismaClient } from '@backend';

export default async function (fastify: FastifyInstance) {
  fastify.get('/', async function (request, reply) {
    try {
      const providers = await prismaClient.energyProvider.findMany({
        include: {
          energyProviderLocations: true,
        },
      });

      const result = providers.map(provider => ({
        fullName: provider.fullName,
        id: provider.id,
        name: provider.name,
        oAuthProviderConfigId: provider.oAuthProviderConfigId,
        type: provider.type,
        zips: provider.energyProviderLocations.map(loc => loc.zip),
      }));

      return reply.status(200).send(result);
    }
    catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        error: 'Failed to fetch energy providers',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });
}
