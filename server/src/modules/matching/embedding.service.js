import { pipeline } from '@huggingface/transformers';
import { env } from '../../config/env.js';
import { normalizeEmbeddingText } from './embeddingText.js';

export const EMBEDDING_DIMENSIONS = 384;

function tensorVector(output) {
  const values = typeof output.tolist === 'function' ? output.tolist() : output;
  const vector = Array.isArray(values?.[0]) ? values[0] : values;
  if (!Array.isArray(vector) || vector.length !== EMBEDDING_DIMENSIONS) {
    throw new Error(`Embedding model must return ${EMBEDDING_DIMENSIONS} dimensions.`);
  }
  if (!vector.every(Number.isFinite)) throw new Error('Embedding model returned invalid values.');
  return vector;
}

export function createEmbeddingService({
  pipelineFactory = pipeline,
  modelName = env.EMBEDDING_MODEL,
  cacheDir = env.MODEL_CACHE_DIR,
  enabled = env.EMBEDDINGS_ENABLED,
} = {}) {
  let modelPromise;

  function loadModel() {
    if (!enabled) return Promise.resolve(null);
    modelPromise ||= pipelineFactory('feature-extraction', modelName, { cache_dir: cacheDir });
    return modelPromise;
  }

  async function embedText(value) {
    if (!enabled) return null;
    const text = normalizeEmbeddingText(value);
    if (!text) throw new Error('Embedding text must not be empty.');
    const model = await loadModel();
    const output = await model(text, { pooling: 'mean', normalize: true });
    return tensorVector(output);
  }

  return { embedText, loadModel, modelName, enabled };
}

export const embeddingService = createEmbeddingService();
