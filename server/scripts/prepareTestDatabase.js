import 'dotenv/config';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const { Client } = pg;
const databaseUrl = process.env.DATABASE_URL;
const testDatabaseUrl = process.env.DATABASE_URL_TEST;

if (!databaseUrl || !testDatabaseUrl) {
  throw new Error(
    'DATABASE_URL and DATABASE_URL_TEST are required to prepare the test database.',
  );
}

const development = new URL(databaseUrl);
const test = new URL(testDatabaseUrl);
const testDatabaseName = decodeURIComponent(test.pathname.slice(1));

if (!/^[a-zA-Z0-9_]+$/.test(testDatabaseName)) {
  throw new Error(
    'DATABASE_URL_TEST must use a simple PostgreSQL database name.',
  );
}

if (
  development.protocol !== test.protocol ||
  development.hostname !== test.hostname ||
  development.port !== test.port ||
  development.username !== test.username
) {
  throw new Error(
    'The development and test databases must use the same local PostgreSQL server.',
  );
}

if (development.pathname === test.pathname) {
  throw new Error(
    'DATABASE_URL_TEST must not point to the development database.',
  );
}

const maintenanceUrl = new URL(databaseUrl);
maintenanceUrl.pathname = '/postgres';
maintenanceUrl.search = '';

const client = new Client({ connectionString: maintenanceUrl.toString() });
await client.connect();
try {
  const existing = await client.query(
    'SELECT 1 FROM pg_database WHERE datname = $1',
    [testDatabaseName],
  );
  if (existing.rowCount === 0) {
    await client.query(`CREATE DATABASE "${testDatabaseName}"`);
    console.log(`Created PostgreSQL test database ${testDatabaseName}.`);
  } else {
    console.log(`PostgreSQL test database ${testDatabaseName} already exists.`);
  }
} finally {
  await client.end();
}

const prismaCli = fileURLToPath(
  new URL('../node_modules/prisma/build/index.js', import.meta.url),
);
const migration = spawn(process.execPath, [prismaCli, 'migrate', 'deploy'], {
  cwd: fileURLToPath(new URL('../', import.meta.url)),
  env: { ...process.env, DATABASE_URL: testDatabaseUrl },
  stdio: 'inherit',
});

const exitCode = await new Promise((resolve, reject) => {
  migration.once('error', reject);
  migration.once('exit', resolve);
});

if (exitCode !== 0) {
  throw new Error(`Test database migration failed with exit code ${exitCode}.`);
}
