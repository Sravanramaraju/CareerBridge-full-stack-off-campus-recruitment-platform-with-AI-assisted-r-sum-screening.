import { prisma } from '../../lib/database.js';
import { jobRecordSelection } from '../jobs/job.repository.js';

export function listRecommendationCandidates(
  applicantId,
  now = new Date(),
  candidateLimit = 40,
  database = prisma,
) {
  return database.job.findMany({
    where: {
      status: 'PUBLISHED',
      moderationStatus: 'CLEARED',
      deadline: { gt: now },
      company: { is: { verificationStatus: 'VERIFIED' } },
      applications: { none: { applicantId } },
    },
    orderBy: [{ featured: 'desc' }, { publishedAt: 'desc' }, { id: 'asc' }],
    take: candidateLimit,
    select: jobRecordSelection,
  });
}
