import { prismaClient } from "../src";

async function main() {
  const mockUtil = await prismaClient.oAuthProviderConfig.upsert({
      where: { providerName: 'mock-util' },
      update: {},
      create: {
        authUrl: 'http://localhost:3001/authorize',
        providerName: "mock-util",
        tokenUrl: 'http://localhost:3001/token',
        redirectUri: "http://localhost:4200/sources",
        scopes: '',
      }
  })
  console.log({ mockUtil })
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
