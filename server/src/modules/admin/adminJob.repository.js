import { prisma } from '../../lib/database.js';

const adminJobSelection = {
  id: true,
  slug: true,
  title: true,
  location: true,
  workMode: true,
  employmentType: true,
  status: true,
  moderationStatus: true,
  deadline: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
  company: { select: { id: true, name: true, verificationStatus: true } },
  _count: { select: { applications: true, savedBy: true } },
};

function buildAdminJobFilters({ q, status, moderationStatus }) {
  return {
    ...(status ? { status } : {}),
    ...(moderationStatus ? { moderationStatus } : {}),
    ...(q ? {
      OR: [
        { title: { contains: q, mode: 'insensitive' } },
        { location: { contains: q, mode: 'insensitive' } },
        { company: { is: { name: { contains: q, mode: 'insensitive' } } } },
      ],
    } : {}),
  };
}

export async function listAdminJobs(filters, database = prisma) {
  const where = buildAdminJobFilters(filters);
  const [jobs, total] = await Promise.all([
    database.job.findMany({
      where,
      select: adminJobSelection,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      skip: (filters.page - 1) * filters.pageSize,
      take: filters.pageSize,
    }),
    database.job.count({ where }),
  ]);
  return { jobs, total };
}

export function findAdminJob(jobId, database = prisma) {
  return database.job.findUnique({ where: { id: jobId }, select: adminJobSelection });
}

export function updateJobModerationStatus(
  jobId,
  currentStatus,
  nextStatus,
  database = prisma,
) {
  return database.job.updateMany({
    where: { id: jobId, moderationStatus: currentStatus },
    data: { moderationStatus: nextStatus },
  });
}
