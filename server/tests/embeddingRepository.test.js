import { describe, expect, it, vi } from 'vitest';
import {
  findJobEmbeddingMetadata,
  findResumeEmbeddingMetadata,
  getJobResumeCosineSimilarity,
  upsertJobEmbedding,
  upsertResumeEmbedding,
} from '../src/modules/matching/embedding.repository.js';

describe('embedding repository', () => {
  it('returns nullable job and resume embedding metadata without loading vectors', async () => {
    const query = vi.fn().mockResolvedValueOnce([{ jobId: 'job-1' }]).mockResolvedValueOnce([]);
    const database = { $queryRaw: query };
    await expect(findJobEmbeddingMetadata('job-1', database))
      .resolves.toEqual({ jobId: 'job-1' });
    await expect(findResumeEmbeddingMetadata('resume-1', database)).resolves.toBeNull();
    expect(query).toHaveBeenCalledTimes(2);
  });

  it('serializes vectors as parameterized pgvector values for idempotent upserts', async () => {
    const execute = vi.fn().mockResolvedValue(1);
    const database = { $executeRaw: execute };
    await upsertJobEmbedding('job-1', [0.1, 0.2], 'model-1', 'hash-1', database);
    await upsertResumeEmbedding('resume-1', [0.3, 0.4], 'model-1', 'hash-2', database);
    expect(execute.mock.calls[0].slice(1)).toEqual(['job-1', '[0.1,0.2]', 'model-1', 'hash-1']);
    expect(execute.mock.calls[1].slice(1)).toEqual(['resume-1', '[0.3,0.4]', 'model-1', 'hash-2']);
  });

  it('returns cosine similarity as a number or null when either embedding is missing', async () => {
    const query = vi.fn()
      .mockResolvedValueOnce([{ similarity: '0.875' }])
      .mockResolvedValueOnce([]);
    await expect(getJobResumeCosineSimilarity('job-1', 'resume-1', { $queryRaw: query }))
      .resolves.toBe(0.875);
    await expect(getJobResumeCosineSimilarity('job-1', 'resume-2', { $queryRaw: query }))
      .resolves.toBeNull();
  });
});
