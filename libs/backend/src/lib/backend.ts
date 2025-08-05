import { PrismaClient } from '@prisma/client';

export const prismaClient = new PrismaClient();

const shutdown = async () => {
  await prismaClient.$disconnect();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
