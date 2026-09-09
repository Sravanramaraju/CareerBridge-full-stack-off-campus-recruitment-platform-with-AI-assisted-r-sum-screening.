import { AppError, notFoundError } from '../../lib/appError.js';
import { prisma } from '../../lib/database.js';
import {
  createApplicantCertification,
  createApplicantEducation,
  createApplicantExperience,
  createApplicantProject,
  createApplicantSkills,
  deleteApplicantSkills,
  deleteOwnedApplicantCertification,
  deleteOwnedApplicantEducation,
  deleteOwnedApplicantExperience,
  deleteOwnedApplicantProject,
  findApplicantProfileByUserId,
  findApplicantProfileIdByUserId,
  findApplicantSkills,
  findOwnedApplicantCertification,
  findOwnedApplicantEducation,
  findOwnedApplicantExperience,
  findOwnedApplicantProject,
  updateApplicantProfileRecord,
  updateApplicantUserName,
  updateOwnedApplicantCertification,
  updateOwnedApplicantEducation,
  updateOwnedApplicantExperience,
  updateOwnedApplicantProject,
} from './profile.repository.js';
import { toApplicantProfile, toApplicantSkillRecords } from './profile.presenter.js';
import { normalizeSkillName } from './skillNormalization.js';
import { upsertSkillRecord } from '../skills/skill.repository.js';

export async function getApplicantProfile(
  userId,
  { findProfile = findApplicantProfileByUserId } = {},
) {
  const profile = await findProfile(userId);
  if (!profile) throw notFoundError('The applicant profile was not found.');
  return toApplicantProfile(profile);
}

export async function updateApplicantProfile(
  userId,
  input,
  {
    runTransaction = (operation) => prisma.$transaction(operation),
    findProfile = findApplicantProfileByUserId,
    updateName = updateApplicantUserName,
    updateProfile = updateApplicantProfileRecord,
  } = {},
) {
  return runTransaction(async (database) => {
    const { name, preferences, ...profileUpdates } = input;

    if (name !== undefined) await updateName(userId, name, database);
    if (preferences?.locations !== undefined) {
      profileUpdates.preferredLocations = preferences.locations;
    }
    if (preferences?.jobTypes !== undefined) {
      profileUpdates.preferredJobTypes = preferences.jobTypes;
    }
    if (preferences?.workModes !== undefined) {
      profileUpdates.preferredWorkModes = preferences.workModes;
    }

    const profile = Object.keys(profileUpdates).length
      ? await updateProfile(userId, profileUpdates, database)
      : await findProfile(userId, database);

    if (!profile) throw notFoundError('The applicant profile was not found.');
    return toApplicantProfile(profile);
  });
}

function educationNotFoundError() {
  return notFoundError('The requested education record was not found.');
}

export function createEducation(
  userId,
  input,
  { createRecord = createApplicantEducation } = {},
) {
  return createRecord(userId, input);
}

export async function updateEducation(
  userId,
  recordId,
  input,
  {
    runTransaction = (operation) => prisma.$transaction(operation),
    findRecord = findOwnedApplicantEducation,
    updateRecord = updateOwnedApplicantEducation,
  } = {},
) {
  return runTransaction(async (database) => {
    const current = await findRecord(recordId, userId, database);
    if (!current) throw educationNotFoundError();

    const startYear = input.startYear === undefined ? current.startYear : input.startYear;
    const endYear = input.endYear === undefined ? current.endYear : input.endYear;
    if (startYear && endYear && endYear < startYear) {
      throw new AppError({
        code: 'VALIDATION_ERROR',
        message: 'The request contains invalid education dates.',
        status: 422,
        fields: { 'body.endYear': 'End year must not be earlier than start year.' },
      });
    }

    const updated = await updateRecord(recordId, userId, input, database);
    if (updated.count !== 1) throw educationNotFoundError();
    return findRecord(recordId, userId, database);
  });
}

export async function deleteEducation(
  userId,
  recordId,
  { deleteRecord = deleteOwnedApplicantEducation } = {},
) {
  const deleted = await deleteRecord(recordId, userId);
  if (deleted.count !== 1) throw educationNotFoundError();
  return { deleted: true };
}

function experienceNotFoundError() {
  return notFoundError('The requested experience record was not found.');
}

export function createExperience(
  userId,
  input,
  { createRecord = createApplicantExperience } = {},
) {
  return createRecord(userId, input);
}

export async function updateExperience(
  userId,
  recordId,
  input,
  {
    runTransaction = (operation) => prisma.$transaction(operation),
    findRecord = findOwnedApplicantExperience,
    updateRecord = updateOwnedApplicantExperience,
  } = {},
) {
  return runTransaction(async (database) => {
    const current = await findRecord(recordId, userId, database);
    if (!current) throw experienceNotFoundError();

    const startDate = input.startDate === undefined ? current.startDate : input.startDate;
    const endDate = input.endDate === undefined ? current.endDate : input.endDate;
    if (startDate && endDate && endDate < startDate) {
      throw new AppError({
        code: 'VALIDATION_ERROR',
        message: 'The request contains invalid experience dates.',
        status: 422,
        fields: { 'body.endDate': 'End date must not be earlier than start date.' },
      });
    }

    const updated = await updateRecord(recordId, userId, input, database);
    if (updated.count !== 1) throw experienceNotFoundError();
    return findRecord(recordId, userId, database);
  });
}

export async function deleteExperience(
  userId,
  recordId,
  { deleteRecord = deleteOwnedApplicantExperience } = {},
) {
  const deleted = await deleteRecord(recordId, userId);
  if (deleted.count !== 1) throw experienceNotFoundError();
  return { deleted: true };
}

function projectNotFoundError() {
  return notFoundError('The requested project record was not found.');
}

export function createProject(
  userId,
  input,
  { createRecord = createApplicantProject } = {},
) {
  return createRecord(userId, input);
}

export async function updateProject(
  userId,
  recordId,
  input,
  {
    runTransaction = (operation) => prisma.$transaction(operation),
    findRecord = findOwnedApplicantProject,
    updateRecord = updateOwnedApplicantProject,
  } = {},
) {
  return runTransaction(async (database) => {
    const current = await findRecord(recordId, userId, database);
    if (!current) throw projectNotFoundError();

    const startedAt = input.startedAt === undefined ? current.startedAt : input.startedAt;
    const completedAt = input.completedAt === undefined ? current.completedAt : input.completedAt;
    if (startedAt && completedAt && completedAt < startedAt) {
      throw new AppError({
        code: 'VALIDATION_ERROR',
        message: 'The request contains invalid project dates.',
        status: 422,
        fields: { 'body.completedAt': 'Completion date must not be earlier than start date.' },
      });
    }

    const updated = await updateRecord(recordId, userId, input, database);
    if (updated.count !== 1) throw projectNotFoundError();
    return findRecord(recordId, userId, database);
  });
}

export async function deleteProject(
  userId,
  recordId,
  { deleteRecord = deleteOwnedApplicantProject } = {},
) {
  const deleted = await deleteRecord(recordId, userId);
  if (deleted.count !== 1) throw projectNotFoundError();
  return { deleted: true };
}

function certificationNotFoundError() {
  return notFoundError('The requested certification record was not found.');
}

export function createCertification(
  userId,
  input,
  { createRecord = createApplicantCertification } = {},
) {
  return createRecord(userId, input);
}

export async function updateCertification(
  userId,
  recordId,
  input,
  {
    runTransaction = (operation) => prisma.$transaction(operation),
    findRecord = findOwnedApplicantCertification,
    updateRecord = updateOwnedApplicantCertification,
  } = {},
) {
  return runTransaction(async (database) => {
    const current = await findRecord(recordId, userId, database);
    if (!current) throw certificationNotFoundError();

    const issuedAt = input.issuedAt === undefined ? current.issuedAt : input.issuedAt;
    const expiresAt = input.expiresAt === undefined ? current.expiresAt : input.expiresAt;
    if (issuedAt && expiresAt && expiresAt < issuedAt) {
      throw new AppError({
        code: 'VALIDATION_ERROR',
        message: 'The request contains invalid certification dates.',
        status: 422,
        fields: { 'body.expiresAt': 'Expiration date must not be earlier than issue date.' },
      });
    }

    const updated = await updateRecord(recordId, userId, input, database);
    if (updated.count !== 1) throw certificationNotFoundError();
    return findRecord(recordId, userId, database);
  });
}

export async function deleteCertification(
  userId,
  recordId,
  { deleteRecord = deleteOwnedApplicantCertification } = {},
) {
  const deleted = await deleteRecord(recordId, userId);
  if (deleted.count !== 1) throw certificationNotFoundError();
  return { deleted: true };
}

export async function replaceApplicantSkills(
  userId,
  skills,
  {
    runTransaction = (operation) => prisma.$transaction(operation),
    findProfile = findApplicantProfileIdByUserId,
    upsertSkill = upsertSkillRecord,
    deleteSkills = deleteApplicantSkills,
    createSkills = createApplicantSkills,
    findSkills = findApplicantSkills,
  } = {},
) {
  return runTransaction(async (database) => {
    const profile = await findProfile(userId, database);
    if (!profile) throw notFoundError('The applicant profile was not found.');

    const storedSkills = await Promise.all(
      skills.map((skill) => upsertSkill({
        name: skill.name,
        normalizedName: normalizeSkillName(skill.name),
      }, database)),
    );

    const links = storedSkills.map((skill, index) => ({
      skillId: skill.id,
      proficiency: skills[index].proficiency ?? null,
      yearsExperience: skills[index].yearsExperience ?? null,
    }));

    await deleteSkills(profile.id, database);
    await createSkills(profile.id, links, database);
    const records = await findSkills(profile.id, database);

    return {
      skills: records.map(({ skill }) => skill.name),
      skillRecords: toApplicantSkillRecords(records),
    };
  });
}
