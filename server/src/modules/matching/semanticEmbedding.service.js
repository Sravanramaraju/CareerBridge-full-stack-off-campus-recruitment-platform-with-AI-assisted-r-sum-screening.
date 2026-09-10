import { prisma } from '../../lib/database.js';
import { logger } from '../../lib/logger.js';
import { embeddingService } from './embedding.service.js';
import {
  findJobEmbeddingMetadata,
  findResumeEmbeddingMetadata,
  getJobResumeCosineSimilarity,
  upsertJobEmbedding,
  upsertResumeEmbedding,
} from './embedding.repository.js';
import {
  buildJobEmbeddingText,
  buildResumeEmbeddingText,
  embeddingContentHash,
} from './embeddingText.js';

function isCurrent(metadata, textHash, modelName) {
  return metadata?.textHash === textHash && metadata.modelName === modelName;
}

export async function ensureJobEmbedding(
  job,
  database = prisma,
  {
    service = embeddingService,
    findMetadata = findJobEmbeddingMetadata,
    upsertEmbedding = upsertJobEmbedding,
  } = {},
) {
  if (!service.enabled) return { available: false, updated: false };
  const text = buildJobEmbeddingText(job);
  const textHash = embeddingContentHash(text);
  const current = await findMetadata(job.id, database);
  if (isCurrent(current, textHash, service.modelName)) {
    return { available: true, updated: false, textHash };
  }
  const vector = await service.embedText(text);
  await upsertEmbedding(job.id, vector, service.modelName, textHash, database);
  return { available: true, updated: true, textHash };
}

export async function ensureResumeEmbedding(
  resume,
  database = prisma,
  {
    service = embeddingService,
    findMetadata = findResumeEmbeddingMetadata,
    upsertEmbedding = upsertResumeEmbedding,
  } = {},
) {
  const text = buildResumeEmbeddingText(resume.extractedText);
  if (!service.enabled || resume.parseStatus !== 'READY' || !text) {
    return { available: false, updated: false };
  }
  const textHash = embeddingContentHash(text);
  const current = await findMetadata(resume.id, database);
  if (isCurrent(current, textHash, service.modelName)) {
    return { available: true, updated: false, textHash };
  }
  const vector = await service.embedText(text);
  await upsertEmbedding(resume.id, vector, service.modelName, textHash, database);
  return { available: true, updated: true, textHash };
}

export async function getSemanticSimilarityScore(
  job,
  resume,
  {
    database = prisma,
    ensureJob = ensureJobEmbedding,
    ensureResume = ensureResumeEmbedding,
    findSimilarity = getJobResumeCosineSimilarity,
    semanticLogger = logger,
  } = {},
) {
  try {
    const [jobEmbedding, resumeEmbedding] = await Promise.all([
      ensureJob(job, database),
      ensureResume(resume, database),
    ]);
    if (!jobEmbedding.available || !resumeEmbedding.available) return null;
    const similarity = await findSimilarity(job.id, resume.id, database);
    if (!Number.isFinite(similarity)) return null;
    return Math.round(Math.max(0, Math.min(1, similarity)) * 100);
  } catch (error) {
    semanticLogger.warn({ err: error, jobId: job.id, resumeId: resume.id },
      'Semantic matching unavailable; structured matching remains active');
    return null;
  }
}

export async function getStoredSemanticSimilarityScore(
  jobId,
  resumeId,
  {
    database = prisma,
    findSimilarity = getJobResumeCosineSimilarity,
    semanticLogger = logger,
  } = {},
) {
  try {
    const similarity = await findSimilarity(jobId, resumeId, database);
    if (!Number.isFinite(similarity)) return null;
    return Math.round(Math.max(0, Math.min(1, similarity)) * 100);
  } catch (error) {
    semanticLogger.warn({ err: error, jobId, resumeId },
      'Stored semantic similarity unavailable; structured matching remains active');
    return null;
  }
}
