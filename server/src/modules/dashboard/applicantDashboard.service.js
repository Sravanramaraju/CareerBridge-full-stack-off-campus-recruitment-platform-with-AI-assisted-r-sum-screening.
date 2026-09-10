import { notFoundError } from '../../lib/appError.js';
import { prisma } from '../../lib/database.js';
import { toApplicantApplication } from '../applications/application.presenter.js';
import { toPublicJob } from '../jobs/job.presenter.js';
import { calculateHybridMatch } from '../matching/hybridMatch.service.js';
import { toApplicantProfile } from '../profiles/profile.presenter.js';
import { getApplicantDashboardData } from './applicantDashboard.repository.js';

const APPLICATION_STATUSES = [
  'APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'OFFERED', 'REJECTED', 'WITHDRAWN',
];

function countsByStatus(rows) {
  const counts = Object.fromEntries(APPLICATION_STATUSES.map((status) => [status, 0]));
  rows.forEach((row) => { counts[row.status] = row._count._all; });
  return counts;
}

function presentSavedJob(entry) {
  return { ...toPublicJob(entry.job), savedAt: entry.createdAt };
}

export async function getApplicantDashboard(
  applicantId,
  {
    runTransaction = (operation) => prisma.$transaction(operation),
    loadDashboard = getApplicantDashboardData,
    calculateMatch = calculateHybridMatch,
    now = () => new Date(),
  } = {},
) {
  return runTransaction(async (database) => {
    const generatedAt = now();
    const data = await loadDashboard(applicantId, generatedAt, database);
    if (!data.profile) throw notFoundError('The applicant profile was not found.');
    const profile = toApplicantProfile(data.profile);

    return {
      user: { id: data.profile.user.id, name: data.profile.user.name },
      profile,
      applicationCounts: countsByStatus(data.applicationCounts),
      recentApplications: data.recentApplications.map(toApplicantApplication),
      savedJobs: data.savedJobs.map(presentSavedJob),
      recommendedJobs: data.recommendedJobs.map((job) => ({
        job: toPublicJob(job),
        match: calculateMatch(job, data.profile, { semanticScore: null, now: generatedAt }),
      })),
      notifications: { unreadCount: data.unreadCount },
      generatedAt,
    };
  });
}
