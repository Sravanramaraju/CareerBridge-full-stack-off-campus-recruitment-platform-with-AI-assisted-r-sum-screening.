import { AppError, notFoundError } from '../../lib/appError.js';
import { prisma } from '../../lib/database.js';
import { findCompanyMembershipForUser } from '../companies/company.repository.js';
import { normalizeSkillName } from '../profiles/skillNormalization.js';
import { upsertSkillRecord } from '../skills/skill.repository.js';
import { createJobSlug } from './jobSlug.service.js';
import {
  createJobScreeningQuestions,
  createJobSkills,
  createRecruiterJob,
  findOwnedRecruiterJob,
  listRecruiterJobs,
} from './recruiterJob.repository.js';

function membershipRequiredError() {
  return new AppError({
    code: 'COMPANY_MEMBERSHIP_REQUIRED',
    message: 'You do not have access to a recruiter company.',
    status: 403,
  });
}

async function createRelations(jobId, skills, screeningQuestions, database, dependencies) {
  const storedSkills = await Promise.all(skills.map((skill) => dependencies.upsertSkill({
    name: skill.name,
    normalizedName: normalizeSkillName(skill.name),
  }, database)));
  await dependencies.createSkills(jobId, storedSkills.map((skill, index) => ({
    skillId: skill.id,
    requirement: skills[index].requirement,
  })), database);
  await dependencies.createQuestions(jobId, screeningQuestions, database);
}

export async function getRecruiterJobs(
  userId,
  {
    findMembership = findCompanyMembershipForUser,
    listJobs = listRecruiterJobs,
  } = {},
) {
  const membership = await findMembership(userId);
  if (!membership) throw membershipRequiredError();
  return listJobs(membership.company.id);
}

export async function getRecruiterJob(
  userId,
  jobId,
  {
    findMembership = findCompanyMembershipForUser,
    findJob = findOwnedRecruiterJob,
  } = {},
) {
  const membership = await findMembership(userId);
  if (!membership) throw membershipRequiredError();
  const job = await findJob(jobId, membership.company.id);
  if (!job) throw notFoundError('The requested job was not found.');
  return job;
}

export async function createRecruiterJobDraft(
  userId,
  input,
  {
    runTransaction = (operation) => prisma.$transaction(operation),
    findMembership = findCompanyMembershipForUser,
    createJob = createRecruiterJob,
    findJob = findOwnedRecruiterJob,
    upsertSkill = upsertSkillRecord,
    createSkills = createJobSkills,
    createQuestions = createJobScreeningQuestions,
    slugFactory = createJobSlug,
  } = {},
) {
  return runTransaction(async (database) => {
    const membership = await findMembership(userId, database);
    if (!membership) throw membershipRequiredError();
    const { skills, screeningQuestions, ...jobFields } = input;
    const job = await createJob(membership.company.id, userId, {
      ...jobFields,
      slug: slugFactory(jobFields.title),
      status: 'DRAFT',
      moderationStatus: 'PENDING',
    }, database);
    await createRelations(job.id, skills, screeningQuestions, database, {
      upsertSkill,
      createSkills,
      createQuestions,
    });
    return findJob(job.id, membership.company.id, database);
  });
}
