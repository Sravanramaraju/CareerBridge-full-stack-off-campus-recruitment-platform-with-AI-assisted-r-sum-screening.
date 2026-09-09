import { prisma } from '../../lib/database.js';

const preferenceSelection = {
  applicationUpdates: true,
  jobRecommendations: true,
  careerResources: true,
  newApplications: true,
  candidateReminders: true,
  jobExpiryReminders: true,
  weeklySummary: true,
  updatedAt: true,
};

export function findOrCreateUserPreferences(userId, database = prisma) {
  return database.userPreference.upsert({
    where: { userId },
    create: { userId },
    update: {},
    select: preferenceSelection,
  });
}

export function updateUserPreferences(userId, data, database = prisma) {
  return database.userPreference.upsert({
    where: { userId },
    create: { userId, ...data },
    update: data,
    select: preferenceSelection,
  });
}
