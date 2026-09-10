import { describe, expect, it, vi } from 'vitest';
import {
  ensureJobEmbedding,
  ensureResumeEmbedding,
  getSemanticSimilarityScore,
  getStoredSemanticSimilarityScore,
} from '../src/modules/matching/semanticEmbedding.service.js';

const database = { marker: 'database' };
const service = {
  enabled: true,
  modelName: 'model-v1',
  embedText: vi.fn().mockResolvedValue([0.1, 0.2]),
};

describe('semantic embedding service', () => {
  it('does not recompute unchanged job embeddings', async () => {
    const job = { id: 'job-1', title: 'Engineer', skills: [], responsibilities: [] };
    const first = await ensureJobEmbedding(job, database, {
      service,
      findMetadata: vi.fn().mockResolvedValue(null),
      upsertEmbedding: vi.fn(),
    });
    const findMetadata = vi.fn().mockResolvedValue({
      modelName: 'model-v1', textHash: first.textHash,
    });
    const upsertEmbedding = vi.fn();
    await expect(ensureJobEmbedding(job, database, {
      service, findMetadata, upsertEmbedding,
    })).resolves.toMatchObject({ available: true, updated: false });
    expect(upsertEmbedding).not.toHaveBeenCalled();
  });

  it('persists ready resume embeddings with content hashes', async () => {
    const upsertEmbedding = vi.fn().mockResolvedValue(1);
    await expect(ensureResumeEmbedding({
      id: 'resume-1', parseStatus: 'READY', extractedText: 'React engineer',
    }, database, {
      service,
      findMetadata: vi.fn().mockResolvedValue(null),
      upsertEmbedding,
    })).resolves.toMatchObject({ available: true, updated: true });
    expect(upsertEmbedding).toHaveBeenCalledWith(
      'resume-1', [0.1, 0.2], 'model-v1', expect.stringMatching(/^[a-f0-9]{64}$/), database,
    );
  });

  it('skips resumes without successfully extracted text', async () => {
    await expect(ensureResumeEmbedding({
      id: 'resume-1', parseStatus: 'FAILED', extractedText: null,
    }, database, { service })).resolves.toEqual({ available: false, updated: false });
  });

  it('returns a bounded semantic percentage after ensuring both vectors', async () => {
    await expect(getSemanticSimilarityScore(
      { id: 'job-1' }, { id: 'resume-1' }, {
        database,
        ensureJob: vi.fn().mockResolvedValue({ available: true }),
        ensureResume: vi.fn().mockResolvedValue({ available: true }),
        findSimilarity: vi.fn().mockResolvedValue(1.2),
      },
    )).resolves.toBe(100);
  });

  it('falls back to structured matching when embeddings fail', async () => {
    const warn = vi.fn();
    await expect(getSemanticSimilarityScore(
      { id: 'job-1' }, { id: 'resume-1' }, {
        database,
        ensureJob: vi.fn().mockRejectedValue(new Error('model unavailable')),
        ensureResume: vi.fn().mockResolvedValue({ available: true }),
        semanticLogger: { warn },
      },
    )).resolves.toBeNull();
    expect(warn).toHaveBeenCalledWith(expect.objectContaining({
      jobId: 'job-1', resumeId: 'resume-1', err: expect.any(Error),
    }), expect.stringContaining('structured matching'));
  });

  it('reads an existing semantic score without generating embeddings', async () => {
    const findSimilarity = vi.fn().mockResolvedValue(0.874);
    await expect(getStoredSemanticSimilarityScore('job-1', 'resume-1', {
      database,
      findSimilarity,
    })).resolves.toBe(87);
    expect(findSimilarity).toHaveBeenCalledWith('job-1', 'resume-1', database);
  });

  it('returns no stored score when either embedding is unavailable', async () => {
    await expect(getStoredSemanticSimilarityScore('job-1', 'resume-1', {
      database,
      findSimilarity: vi.fn().mockResolvedValue(null),
    })).resolves.toBeNull();
  });

  it('contains stored similarity query failures', async () => {
    const warn = vi.fn();
    await expect(getStoredSemanticSimilarityScore('job-1', 'resume-1', {
      database,
      findSimilarity: vi.fn().mockRejectedValue(new Error('pgvector unavailable')),
      semanticLogger: { warn },
    })).resolves.toBeNull();
    expect(warn).toHaveBeenCalledWith(expect.objectContaining({
      jobId: 'job-1', resumeId: 'resume-1', err: expect.any(Error),
    }), expect.stringContaining('structured matching'));
  });
});
