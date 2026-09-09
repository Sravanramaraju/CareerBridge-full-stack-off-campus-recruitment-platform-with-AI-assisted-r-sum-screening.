import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { env } from '../config/env.js';

const globalDatabase = globalThis;

function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });

  return new PrismaClient({
    adapter,
    log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });
}

export const prisma = globalDatabase.careerBridgePrisma ?? createPrismaClient();

if (env.NODE_ENV !== 'production') {
  globalDatabase.careerBridgePrisma = prisma;
}

export async function disconnectDatabase() {
  await prisma.$disconnect();
}
