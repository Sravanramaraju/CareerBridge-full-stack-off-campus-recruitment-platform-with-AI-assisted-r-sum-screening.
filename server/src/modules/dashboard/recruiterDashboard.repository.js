import { prisma } from '../../lib/database.js';
import { candidateSelection } from '../applications/recruiterApplication.repository.js';
import { recruiterJobSelection } from '../jobs/recruiterJob.repository.js';

export async function getRecruiterDashboardData(
  recruiterId,
  companyId,
  now = new Date(),
  database = prisma,
) {
  const closingWindow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1_000);
  const [jobCounts, stageCounts, recentCandidates, activeJobs, closingSoon, unreadCount] =
    await Promise.all([
      database.job.groupBy({
        by: ['status'], where: { companyId }, _count: { _all: true },
      }),
      database.application.groupBy({
        by: ['status'], where: { job: { is: { companyId } } }, _count: { _all: true },
      }),
      database.application.findMany({
        where: { job: { is: { companyId } } },
        orderBy: [{ appliedAt: 'desc' }, { id: 'desc' }],
        take: 5,
        select: {
          ...candidateSelection,
          job: { select: { id: true, title: true } },
        },
      }),
      database.job.findMany({
        where: { companyId, status: 'PUBLISHED' },
        orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
        take: 4,
        select: recruiterJobSelection,
      }),
      database.job.count({
        where: {
          companyId,
          status: 'PUBLISHED',
          deadline: { gt: now, lte: closingWindow },
        },
      }),
      database.notification.count({ where: { userId: recruiterId, readAt: null } }),
    ]);

  return { jobCounts, stageCounts, recentCandidates, activeJobs, closingSoon, unreadCount };
}
