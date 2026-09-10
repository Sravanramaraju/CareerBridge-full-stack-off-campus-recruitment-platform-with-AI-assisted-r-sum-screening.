import { pathToFileURL } from 'node:url';
import { embeddingService } from '../src/modules/matching/embedding.service.js';

export async function warmupEmbeddings({
  service = embeddingService,
  write = (message) => process.stdout.write(`${message}\n`),
} = {}) {
  if (!service.enabled) {
    write('Semantic embeddings are disabled; no model was downloaded.');
    return { warmed: false, modelName: service.modelName };
  }
  write(`Preparing local embedding model: ${service.modelName}`);
  await service.loadModel();
  write('Embedding model is ready.');
  return { warmed: true, modelName: service.modelName };
}

const entryUrl = process.argv[1] ? pathToFileURL(process.argv[1]).href : null;
if (entryUrl === import.meta.url) {
  warmupEmbeddings().catch((error) => {
    process.stderr.write(`Embedding warmup failed: ${error.message}\n`);
    process.exitCode = 1;
  });
}
