import { prisma } from '../../lib/database.js';
import { jobRecordSelection } from './job.repository.js';

const recruiterJobSelection = {
  ...jobRecordSelection,
  moderationStatus: true,
  closedAt: true,
  updatedAt: true,
  _count: { select: { applications: true } },
};

export function listRecruiterJobs(companyId, database = prisma) {
  return database.job.findMany({
    where: { companyId },
    orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
    select: recruiterJobSelection,
  });
}

export function findOwnedRecruiterJob(jobId, companyId, database = prisma) {
  return database.job.findFirst({
    where: { id: jobId, companyId },
    select: recruiterJobSelection,
  });
}

export function createRecruiterJob(companyId, createdByUserId, data, database = prisma) {
  return database.job.create({
    data: { ...data, companyId, createdByUserId },
    select: recruiterJobSelection,
  });
}

export function updateOwnedRecruiterJob(jobId, companyId, data, database = prisma) {
  return database.job.updateMany({
    where: { id: jobId, companyId },
    data,
  });
}
