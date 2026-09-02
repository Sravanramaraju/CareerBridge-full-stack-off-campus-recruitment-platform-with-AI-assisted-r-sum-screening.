import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const serverDirectory = path.join(projectRoot, 'dist', 'server');
const workerEntry = `export default {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request);
    if (response.status !== 404 || request.method !== 'GET') return response;

    const fallbackUrl = new URL('/index.html', request.url);
    return env.ASSETS.fetch(new Request(fallbackUrl, request));
  },
};
`;

await mkdir(serverDirectory, { recursive: true });
await writeFile(path.join(serverDirectory, 'index.js'), workerEntry, 'utf8');
