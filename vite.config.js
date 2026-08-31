import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { sites } from '@openai/sites-vite-plugin';
import tailwindcss from '@tailwindcss/postcss';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  css: { postcss: { plugins: [tailwindcss()] } },
  plugins: [react(), sites()],
  resolve: {
    alias: {
      '@': rootDir,
    },
  },
});
