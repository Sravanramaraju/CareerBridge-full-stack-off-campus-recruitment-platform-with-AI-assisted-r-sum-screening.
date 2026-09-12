import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    env: {
      DATABASE_URL:
        'postgresql://careerbridge:careerbridge_dev@localhost:5433/careerbridge_test',
      OUTBOX_ENCRYPTION_KEY:
        '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
    },
    environment: 'node',
    include: ['tests/**/*.test.js'],
    exclude: ['tests/integration/**/*.test.js'],
    pool: 'forks',
    maxWorkers: 1,
    fileParallelism: false,
  },
});
