import { PrismaClient } from '@prisma/client';
import seedConfig from './seed-config.json';

const prismaClient = new PrismaClient();

async function main() {
  // Clear stale connections — tokens are tied to the OAuth redirect URI,
  // so they become invalid if provider config changes.
  const deleted = await prismaClient.energyProviderConnection.deleteMany();
  console.log({ deletedConnections: deleted.count });

  for (const provider of seedConfig.providers) {
    const oauthConfig = await prismaClient.oAuthProviderConfig.upsert({
      where: { clientId: provider.oauth.clientId },
      update: provider.oauth,
      create: provider.oauth,
    });
    console.log({ oauthConfig });

    const energyProvider = await prismaClient.energyProvider.upsert({
      where: { name: provider.name },
      update: {
        fullName: provider.fullName,
        name: provider.name,
        oAuthProviderConfigId: oauthConfig.id,
        type: provider.type,
      },
      create: {
        fullName: provider.fullName,
        name: provider.name,
        oAuthProviderConfigId: oauthConfig.id,
        type: provider.type,
      },
    });
    console.log({ energyProvider });

    for (const zip of provider.locations) {
      const existing = await prismaClient.energyProviderLocation.findFirst({
        where: { energyProviderId: energyProvider.id, zip },
      });
      const location = existing ?? await prismaClient.energyProviderLocation.create({
        data: { energyProviderId: energyProvider.id, zip },
      });
      console.log({ location });
    }
  }
}

main()
  .then(async () => {
    await prismaClient.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prismaClient.$disconnect();
    process.exit(1);
  });
