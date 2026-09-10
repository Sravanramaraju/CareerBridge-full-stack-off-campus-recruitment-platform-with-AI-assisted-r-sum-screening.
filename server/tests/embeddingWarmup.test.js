import { describe, expect, it, vi } from 'vitest';
import { warmupEmbeddings } from '../scripts/warmupEmbeddings.js';

describe('embedding warmup', () => {
  it('preloads an enabled model without embedding a request', async () => {
    const loadModel = vi.fn().mockResolvedValue(vi.fn());
    const write = vi.fn();
    await expect(warmupEmbeddings({
      service: { enabled: true, modelName: 'local-model', loadModel }, write,
    })).resolves.toEqual({ warmed: true, modelName: 'local-model' });
    expect(loadModel).toHaveBeenCalledOnce();
    expect(write).toHaveBeenLastCalledWith('Embedding model is ready.');
  });

  it('skips downloads when embeddings are disabled', async () => {
    const loadModel = vi.fn();
    await expect(warmupEmbeddings({
      service: { enabled: false, modelName: 'local-model', loadModel }, write: vi.fn(),
    })).resolves.toEqual({ warmed: false, modelName: 'local-model' });
    expect(loadModel).not.toHaveBeenCalled();
  });
});
