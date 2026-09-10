import { describe, expect, it, vi } from 'vitest';
import {
  EMBEDDING_DIMENSIONS,
  createEmbeddingService,
} from '../src/modules/matching/embedding.service.js';

describe('embedding service', () => {
  it('lazy-loads one model and requests mean-pooled normalized vectors', async () => {
    const vector = Array.from({ length: EMBEDDING_DIMENSIONS }, (_, index) => index / 1_000);
    const model = vi.fn().mockResolvedValue({ tolist: () => [vector] });
    const pipelineFactory = vi.fn().mockResolvedValue(model);
    const service = createEmbeddingService({
      pipelineFactory,
      modelName: 'Xenova/all-MiniLM-L6-v2',
      cacheDir: './model-cache',
      enabled: true,
    });
    await expect(service.embedText('  React\n engineer ')).resolves.toEqual(vector);
    await service.embedText('Node.js engineer');
    expect(pipelineFactory).toHaveBeenCalledOnce();
    expect(pipelineFactory).toHaveBeenCalledWith(
      'feature-extraction', 'Xenova/all-MiniLM-L6-v2', { cache_dir: './model-cache' },
    );
    expect(model).toHaveBeenNthCalledWith(1, 'React engineer', {
      pooling: 'mean', normalize: true,
    });
  });

  it('does not load a model when semantic embeddings are disabled', async () => {
    const pipelineFactory = vi.fn();
    const service = createEmbeddingService({ pipelineFactory, enabled: false });
    await expect(service.embedText('React engineer')).resolves.toBeNull();
    expect(pipelineFactory).not.toHaveBeenCalled();
  });

  it('rejects empty inputs and unexpected model dimensions', async () => {
    const service = createEmbeddingService({
      pipelineFactory: vi.fn().mockResolvedValue(vi.fn().mockResolvedValue({
        tolist: () => [[0.1, 0.2]],
      })),
      enabled: true,
    });
    await expect(service.embedText(' ')).rejects.toThrow('must not be empty');
    await expect(service.embedText('React')).rejects.toThrow('384 dimensions');
  });
});
