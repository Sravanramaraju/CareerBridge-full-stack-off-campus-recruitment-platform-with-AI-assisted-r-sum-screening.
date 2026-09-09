import { AppError, notFoundError } from '../../lib/appError.js';
import { prisma } from '../../lib/database.js';
import {
  createApplicantEducation,
  deleteOwnedApplicantEducation,
  findApplicantProfileByUserId,
  findOwnedApplicantEducation,
  updateApplicantProfileRecord,
  updateApplicantUserName,
  updateOwnedApplicantEducation,
} from './profile.repository.js';
import { toApplicantProfile } from './profile.presenter.js';

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
