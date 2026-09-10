import { prisma } from '../../lib/database.js';
import { jobRecordSelection } from '../jobs/job.repository.js';

export function listApplicantSavedJobs(applicantId, database = prisma) {
  return database.savedJob.findMany({
    where: { applicantId },
    orderBy: [{ createdAt: 'desc' }, { jobId: 'asc' }],
    select: {
      createdAt: true,
      job: { select: jobRecordSelection },
    },
  });
}

export function upsertApplicantSavedJob(applicantId, jobId, database = prisma) {
  return database.savedJob.upsert({
    where: { applicantId_jobId: { applicantId, jobId } },
    create: { applicantId, jobId },
    update: {},
    select: { applicantId: true, jobId: true, createdAt: true },
  });
}

export function deleteApplicantSavedJob(applicantId, jobId, database = prisma) {
  return database.savedJob.deleteMany({ where: { applicantId, jobId } });
}
