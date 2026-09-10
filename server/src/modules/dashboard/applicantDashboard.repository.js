import { prisma } from '../../lib/database.js';
import { applicantApplicationSelection } from '../applications/application.repository.js';
import { jobRecordSelection } from '../jobs/job.repository.js';
import { findApplicantProfileByUserId } from '../profiles/profile.repository.js';

export async function getApplicantDashboardData(
  applicantId,
  now = new Date(),
  database = prisma,
) {
  const [profile, applicationCounts, recentApplications, savedJobs, recommendedJobs, unreadCount] =
    await Promise.all([
      findApplicantProfileByUserId(applicantId, database),
      database.application.groupBy({
        by: ['status'],
        where: { applicantId },
        _count: { _all: true },
      }),
      database.application.findMany({
        where: { applicantId },
        orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
        take: 3,
        select: applicantApplicationSelection,
      }),
      database.savedJob.findMany({
        where: { applicantId },
        orderBy: [{ createdAt: 'desc' }, { jobId: 'asc' }],
        take: 2,
        select: { createdAt: true, job: { select: jobRecordSelection } },
      }),
      database.job.findMany({
        where: {
          status: 'PUBLISHED',
          moderationStatus: 'CLEARED',
          deadline: { gt: now },
          company: { is: { verificationStatus: 'VERIFIED' } },
          applications: { none: { applicantId } },
        },
        orderBy: [{ featured: 'desc' }, { publishedAt: 'desc' }, { id: 'asc' }],
        take: 4,
        select: jobRecordSelection,
      }),
      database.notification.count({ where: { userId: applicantId, readAt: null } }),
    ]);

  return {
    profile,
    applicationCounts,
    recentApplications,
    savedJobs,
    recommendedJobs,
    unreadCount,
  };
}
