import { notFoundError } from '../../lib/appError.js';
import { prisma } from '../../lib/database.js';
import {
  findApplicantProfileByUserId,
  updateApplicantProfileRecord,
  updateApplicantUserName,
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
