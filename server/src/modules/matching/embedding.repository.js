import { prisma } from '../../lib/database.js';

function vectorLiteral(vector) {
  return `[${vector.join(',')}]`;
}

export async function findJobEmbeddingMetadata(jobId, database = prisma) {
  const rows = await database.$queryRaw`
    SELECT "jobId", "modelName", "textHash", "updatedAt"
    FROM "job_embeddings"
    WHERE "jobId" = ${jobId}
    LIMIT 1
  `;
  return rows[0] ?? null;
}

export function upsertJobEmbedding(jobId, vector, modelName, textHash, database = prisma) {
  const serialized = vectorLiteral(vector);
  return database.$executeRaw`
    INSERT INTO "job_embeddings" ("jobId", "embedding", "modelName", "textHash", "updatedAt")
    VALUES (${jobId}, ${serialized}::vector, ${modelName}, ${textHash}, NOW())
    ON CONFLICT ("jobId") DO UPDATE SET
      "embedding" = EXCLUDED."embedding",
      "modelName" = EXCLUDED."modelName",
      "textHash" = EXCLUDED."textHash",
      "updatedAt" = NOW()
  `;
}

export async function findResumeEmbeddingMetadata(resumeId, database = prisma) {
  const rows = await database.$queryRaw`
    SELECT "resumeId", "modelName", "textHash", "updatedAt"
    FROM "resume_embeddings"
    WHERE "resumeId" = ${resumeId}
    LIMIT 1
  `;
  return rows[0] ?? null;
}

export function upsertResumeEmbedding(resumeId, vector, modelName, textHash, database = prisma) {
  const serialized = vectorLiteral(vector);
  return database.$executeRaw`
    INSERT INTO "resume_embeddings" ("resumeId", "embedding", "modelName", "textHash", "updatedAt")
    VALUES (${resumeId}, ${serialized}::vector, ${modelName}, ${textHash}, NOW())
    ON CONFLICT ("resumeId") DO UPDATE SET
      "embedding" = EXCLUDED."embedding",
      "modelName" = EXCLUDED."modelName",
      "textHash" = EXCLUDED."textHash",
      "updatedAt" = NOW()
  `;
}

export async function getJobResumeCosineSimilarity(jobId, resumeId, database = prisma) {
  const rows = await database.$queryRaw`
    SELECT 1 - (jobs."embedding" <=> resumes."embedding") AS "similarity"
    FROM "job_embeddings" jobs
    CROSS JOIN "resume_embeddings" resumes
    WHERE jobs."jobId" = ${jobId} AND resumes."resumeId" = ${resumeId}
    LIMIT 1
  `;
  return rows[0] ? Number(rows[0].similarity) : null;
}
