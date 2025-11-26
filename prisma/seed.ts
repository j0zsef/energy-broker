import { prismaClient } from "../src";
import { EnergyProvider, EnergyProviderLocation, OAuthProviderConfig } from "../../shared/src";

async function main() {
  const mockUtilOAuth = await prismaClient.oAuthProviderConfig.upsert({
    where: { clientId: 'mock-util' },
    update: {},
    create: {
      authUrl: 'http://localhost:3001/authorize',
      clientId: 'mock-util',
      redirectUri: "http://localhost:4200/connections/callback",
      scopes: '',
      tokenUrl: 'http://localhost:3002/token',
    } as OAuthProviderConfig,
  })
  console.log({ mockUtilOAuth })

  const mockUtilProvider = await prismaClient.energyProvider.upsert({
      where: { name: 'Mock Utility' },
      update: {},
      create: {
        fullName: 'Mock Utility',
        name: 'Mock Utility',
        oAuthProviderConfigId: mockUtilOAuth.id,
        type: 'electrical',
      } as EnergyProvider,
  })

  console.log({ mockUtilProvider })

  const mockUtilLocation = await prismaClient.energyProviderLocation.upsert({
    where: { id: 1 },
    update: {},
    create: {
      energyProviderId: mockUtilProvider.id,
      zip: '60657',
    } as EnergyProviderLocation,
  })

  console.log({ mockUtilLocation })
}
main()
  .then(async () => {
    await prismaClient.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prismaClient.$disconnect()
    process.exit(1)
  })
