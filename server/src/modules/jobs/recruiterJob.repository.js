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

export function transitionOwnedRecruiterJob(
  jobId,
  companyId,
  expectedStatuses,
  data,
  database = prisma,
) {
  return database.job.updateMany({
    where: { id: jobId, companyId, status: { in: expectedStatuses } },
    data,
  });
}

export function deleteJobSkills(jobId, database = prisma) {
  return database.jobSkill.deleteMany({ where: { jobId } });
}

export async function createJobSkills(jobId, skills, database = prisma) {
  if (skills.length === 0) return { count: 0 };
  return database.jobSkill.createMany({
    data: skills.map(({ skillId, requirement }) => ({ jobId, skillId, requirement })),
  });
}

export function deleteJobScreeningQuestions(jobId, database = prisma) {
  return database.jobScreeningQuestion.deleteMany({ where: { jobId } });
}

export async function createJobScreeningQuestions(jobId, questions, database = prisma) {
  if (questions.length === 0) return { count: 0 };
  return database.jobScreeningQuestion.createMany({
    data: questions.map(({ question, required }, sortOrder) => ({
      jobId,
      question,
      required,
      sortOrder,
    })),
  });
}
