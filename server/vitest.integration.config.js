import 'dotenv/config';
import { defineConfig } from 'vitest/config';

if (!process.env.DATABASE_URL_TEST) {
  throw new Error('DATABASE_URL_TEST is required for integration tests.');
}

export default defineConfig({
  test: {
    env: {
      DATABASE_URL: process.env.DATABASE_URL_TEST,
      DATABASE_URL_TEST: process.env.DATABASE_URL_TEST,
      NODE_ENV: 'test',
      AUTH_RATE_LIMIT_MAX: '1000',
      PASSWORD_RATE_LIMIT_MAX: '1000',
      EMBEDDINGS_ENABLED: 'false',
    },
    environment: 'node',
    include: ['tests/integration/**/*.test.js'],
    pool: 'forks',
    maxWorkers: 1,
    fileParallelism: false,
  },
});
