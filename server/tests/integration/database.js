import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const databaseUrl = process.env.DATABASE_URL;
const testDatabaseUrl = process.env.DATABASE_URL_TEST;

if (!databaseUrl || !testDatabaseUrl || databaseUrl !== testDatabaseUrl) {
  throw new Error(
    'Integration tests must run with DATABASE_URL set to DATABASE_URL_TEST.',
  );
}

const databaseName = decodeURIComponent(new URL(databaseUrl).pathname.slice(1));
if (!databaseName.endsWith('_test')) {
  throw new Error(
    'Refusing to reset a database whose name does not end with _test.',
  );
}

export const integrationDatabase = new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseUrl }),
});

export async function resetIntegrationDatabase() {
  const tables = await integrationDatabase.$queryRaw`
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename <> '_prisma_migrations'
  `;

  if (tables.length === 0) return;
  const quotedTables = tables
    .map(({ tablename }) => `"${tablename.replaceAll('"', '""')}"`)
    .join(', ');
  await integrationDatabase.$executeRawUnsafe(
    `TRUNCATE TABLE ${quotedTables} RESTART IDENTITY CASCADE`,
  );
}

export function closeIntegrationDatabase() {
  return integrationDatabase.$disconnect();
}
