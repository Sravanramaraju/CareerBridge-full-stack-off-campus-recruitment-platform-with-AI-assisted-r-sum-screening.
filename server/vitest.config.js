import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
    pool: 'threads',
    maxWorkers: 1,
    fileParallelism: false,
  },
});
