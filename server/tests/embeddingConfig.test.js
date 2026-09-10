import { describe, expect, it } from 'vitest';
import { env } from '../src/config/env.js';

describe('embedding configuration', () => {
  it('provides explicit local model defaults with boolean enablement', () => {
    expect(env.EMBEDDINGS_ENABLED).toBe(true);
    expect(env.EMBEDDING_MODEL).toBe('Xenova/all-MiniLM-L6-v2');
    expect(env.MODEL_CACHE_DIR).toBe('./.cache/models');
  });
});
