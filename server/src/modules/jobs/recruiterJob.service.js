import { AppError, notFoundError } from '../../lib/appError.js';
import { prisma } from '../../lib/database.js';
import { findCompanyMembershipForUser } from '../companies/company.repository.js';
import { normalizeSkillName } from '../profiles/skillNormalization.js';
import { upsertSkillRecord } from '../skills/skill.repository.js';
import { assertJobReadyForPublication } from './jobPublication.service.js';
import { createJobSlug } from './jobSlug.service.js';
import {
  createJobScreeningQuestions,
  createJobSkills,
  createRecruiterJob,
  deleteJobScreeningQuestions,
  deleteJobSkills,
  findOwnedRecruiterJob,
  listRecruiterJobs,
  transitionOwnedRecruiterJob,
  updateOwnedRecruiterJob,
} from './recruiterJob.repository.js';

function membershipRequiredError() {
  return new AppError({
    code: 'COMPANY_MEMBERSHIP_REQUIRED',
    message: 'You do not have access to a recruiter company.',
    status: 403,
  });
}

function invalidJobStateError(message) {
  return new AppError({ code: 'INVALID_JOB_STATE', message, status: 409 });
}

function unverifiedCompanyError() {
  return new AppError({
    code: 'COMPANY_NOT_VERIFIED',
    message: 'Your company must be verified before publishing jobs.',
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

export async function updateRecruiterJobDraft(
  userId,
  jobId,
  input,
  {
    runTransaction = (operation) => prisma.$transaction(operation),
    findMembership = findCompanyMembershipForUser,
    findJob = findOwnedRecruiterJob,
    updateJob = updateOwnedRecruiterJob,
    upsertSkill = upsertSkillRecord,
    deleteSkills = deleteJobSkills,
    createSkills = createJobSkills,
    deleteQuestions = deleteJobScreeningQuestions,
    createQuestions = createJobScreeningQuestions,
  } = {},
) {
  return runTransaction(async (database) => {
    const membership = await findMembership(userId, database);
    if (!membership) throw membershipRequiredError();
    const current = await findJob(jobId, membership.company.id, database);
    if (!current) throw notFoundError('The requested job was not found.');

    const experienceMin = input.experienceMin ?? current.experienceMin;
    const experienceMax = input.experienceMax ?? current.experienceMax;
    const salaryMin = input.salaryMin === undefined ? current.salaryMin : input.salaryMin;
    const salaryMax = input.salaryMax === undefined ? current.salaryMax : input.salaryMax;
    if (experienceMax < experienceMin || (salaryMin !== null && salaryMax !== null
      && Number(salaryMax) < Number(salaryMin))) {
      throw new AppError({
        code: 'VALIDATION_ERROR',
        message: 'The request contains invalid job ranges.',
        status: 422,
        fields: { 'body': 'Maximum values must not be lower than minimum values.' },
      });
    }

    const { skills, screeningQuestions, ...jobFields } = input;
    const moderationUpdate = current.status === 'PUBLISHED' ? { moderationStatus: 'PENDING' } : {};
    const updated = await updateJob(jobId, membership.company.id, {
      ...jobFields,
      ...moderationUpdate,
    }, database);
    if (updated.count !== 1) throw notFoundError('The requested job was not found.');

    if (skills !== undefined) {
      await deleteSkills(jobId, database);
      const storedSkills = await Promise.all(skills.map((skill) => upsertSkill({
        name: skill.name,
        normalizedName: normalizeSkillName(skill.name),
      }, database)));
      await createSkills(jobId, storedSkills.map((skill, index) => ({
        skillId: skill.id,
        requirement: skills[index].requirement,
      })), database);
    }
    if (screeningQuestions !== undefined) {
      await deleteQuestions(jobId, database);
      await createQuestions(jobId, screeningQuestions, database);
    }
    return findJob(jobId, membership.company.id, database);
  });
}

export async function publishRecruiterJob(
  userId,
  jobId,
  {
    runTransaction = (operation) => prisma.$transaction(operation),
    findMembership = findCompanyMembershipForUser,
    findJob = findOwnedRecruiterJob,
    transitionJob = transitionOwnedRecruiterJob,
    assertReady = assertJobReadyForPublication,
    now = () => new Date(),
  } = {},
) {
  return runTransaction(async (database) => {
    const membership = await findMembership(userId, database);
    if (!membership) throw membershipRequiredError();
    if (membership.company.verificationStatus !== 'VERIFIED') throw unverifiedCompanyError();

    const job = await findJob(jobId, membership.company.id, database);
    if (!job) throw notFoundError('The requested job was not found.');
    if (job.status !== 'DRAFT') {
      throw invalidJobStateError('Only draft jobs can be published.');
    }
    const publishedAt = now();
    assertReady(job, publishedAt);
    const updated = await transitionJob(jobId, membership.company.id, ['DRAFT'], {
      status: 'PUBLISHED',
      moderationStatus: 'PENDING',
      publishedAt,
      closedAt: null,
    }, database);
    if (updated.count !== 1) {
      throw invalidJobStateError('The job changed while it was being published. Refresh and retry.');
    }
    return findJob(jobId, membership.company.id, database);
  });
}

export async function closeRecruiterJob(
  userId,
  jobId,
  {
    runTransaction = (operation) => prisma.$transaction(operation),
    findMembership = findCompanyMembershipForUser,
    findJob = findOwnedRecruiterJob,
    transitionJob = transitionOwnedRecruiterJob,
    now = () => new Date(),
  } = {},
) {
  return runTransaction(async (database) => {
    const membership = await findMembership(userId, database);
    if (!membership) throw membershipRequiredError();
    const job = await findJob(jobId, membership.company.id, database);
    if (!job) throw notFoundError('The requested job was not found.');
    if (job.status !== 'PUBLISHED') {
      throw invalidJobStateError('Only published jobs can be closed.');
    }

    const closedAt = now();
    const updated = await transitionJob(jobId, membership.company.id, ['PUBLISHED'], {
      status: 'CLOSED',
      closedAt,
    }, database);
    if (updated.count !== 1) {
      throw invalidJobStateError('The job changed while it was being closed. Refresh and retry.');
    }
    return findJob(jobId, membership.company.id, database);
  });
}
