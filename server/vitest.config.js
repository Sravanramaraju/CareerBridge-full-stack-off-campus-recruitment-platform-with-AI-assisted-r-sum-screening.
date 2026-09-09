import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    env: {
      DATABASE_URL: 'postgresql://careerbridge:careerbridge_test@localhost:5432/careerbridge_test',
    },
    environment: 'node',
    include: ['tests/**/*.test.js'],
    pool: 'threads',
    maxWorkers: 1,
    fileParallelism: false,
  },
});
