import { prisma } from '../../lib/database.js';

const moderationActions = [
  'COMPANY_VERIFICATION_CHANGED',
  'JOB_MODERATION_CHANGED',
  'USER_STATUS_CHANGED',
];

export async function getAdminDashboardMetrics(database = prisma) {
  const [
    totalUsers,
    activeApplicants,
    recruiters,
    pendingCompanies,
    publishedJobs,
    flaggedJobs,
    applications,
    recentModeration,
  ] = await Promise.all([
    database.user.count(),
    database.user.count({ where: { role: 'APPLICANT', status: 'ACTIVE' } }),
    database.user.count({ where: { role: 'RECRUITER' } }),
    database.company.count({ where: { verificationStatus: 'PENDING' } }),
    database.job.count({ where: { status: 'PUBLISHED' } }),
    database.job.count({ where: { moderationStatus: 'FLAGGED' } }),
    database.application.count(),
    database.auditLog.findMany({
      where: { action: { in: moderationActions } },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: 10,
      select: {
        id: true,
        action: true,
        entityType: true,
        entityId: true,
        metadata: true,
        createdAt: true,
        actor: { select: { id: true, name: true, email: true } },
      },
    }),
  ]);

  return {
    totalUsers,
    activeApplicants,
    recruiters,
    pendingCompanies,
    publishedJobs,
    flaggedJobs,
    applications,
    recentModeration,
  };
}
