import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': rootDir,
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    pool: 'threads',
    maxWorkers: 1,
    fileParallelism: false,
    teardownTimeout: 1000,
  },
});
