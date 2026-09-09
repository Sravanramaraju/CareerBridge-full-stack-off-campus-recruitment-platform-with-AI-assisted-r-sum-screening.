import { notFoundError } from '../../lib/appError.js';
import { findApplicantProfileByUserId } from './profile.repository.js';
import { toApplicantProfile } from './profile.presenter.js';

export async function getApplicantProfile(
  userId,
  { findProfile = findApplicantProfileByUserId } = {},
) {
  const profile = await findProfile(userId);
  if (!profile) throw notFoundError('The applicant profile was not found.');
  return toApplicantProfile(profile);
}
