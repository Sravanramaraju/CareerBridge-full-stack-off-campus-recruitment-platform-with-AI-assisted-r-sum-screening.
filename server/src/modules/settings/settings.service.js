import { AppError } from '../../lib/appError.js';
import {
  findOrCreateUserPreferences,
  updateUserPreferences,
} from './settings.repository.js';

const roleFields = {
  APPLICANT: ['applicationUpdates', 'jobRecommendations', 'careerResources'],
  RECRUITER: ['newApplications', 'candidateReminders', 'jobExpiryReminders', 'weeklySummary'],
};

function presentSettings(role, settings) {
  return Object.fromEntries([
    ...roleFields[role].map((field) => [field, settings[field]]),
    ['updatedAt', settings.updatedAt],
  ]);
}

export async function getSettings(
  userId,
  role,
  { findPreferences = findOrCreateUserPreferences } = {},
) {
  const settings = await findPreferences(userId);
  return presentSettings(role, settings);
}

export async function updateSettings(
  userId,
  role,
  input,
  { updatePreferences = updateUserPreferences } = {},
) {
  const allowedFields = roleFields[role];
  const forbiddenField = Object.keys(input).find((field) => !allowedFields.includes(field));
  if (forbiddenField) {
    throw new AppError({
      code: 'VALIDATION_ERROR',
      message: 'The request contains a setting unavailable for this account role.',
      status: 422,
      fields: { [`body.${forbiddenField}`]: 'This setting is unavailable for your account role.' },
    });
  }

  const settings = await updatePreferences(userId, input);
  return presentSettings(role, settings);
}
