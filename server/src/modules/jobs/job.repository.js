import { prisma } from '../../lib/database.js';
import { buildPublicJobQuery } from './jobQuery.js';

export const jobRecordSelection = {
  id: true,
  slug: true,
  companyId: true,
  title: true,
  department: true,
  category: true,
  location: true,
  workMode: true,
  employmentType: true,
  openings: true,
  experienceMin: true,
  experienceMax: true,
  salaryMin: true,
  salaryMax: true,
  currency: true,
  hideSalary: true,
  summary: true,
  description: true,
  responsibilities: true,
  qualification: true,
  featured: true,
  status: true,
  deadline: true,
  publishedAt: true,
  createdAt: true,
  company: {
    select: {
      id: true,
      slug: true,
      name: true,
      brandInitials: true,
      brandColor: true,
      logoUrl: true,
      verificationStatus: true,
    },
  },
  skills: {
    select: {
      requirement: true,
      skill: { select: { id: true, name: true, normalizedName: true } },
    },
    orderBy: { skill: { name: 'asc' } },
  },
  screeningQuestions: {
    select: { id: true, question: true, sortOrder: true, required: true },
    orderBy: { sortOrder: 'asc' },
  },
};

export async function listPublicJobs(
  filters,
  now = new Date(),
  database = prisma,
  companyIdentifier,
) {
  const { where, orderBy } = buildPublicJobQuery(filters, now, companyIdentifier);
  const [jobs, total] = await Promise.all([
    database.job.findMany({
      where,
      select: jobRecordSelection,
      orderBy,
      skip: (filters.page - 1) * filters.pageSize,
      take: filters.pageSize,
    }),
    database.job.count({ where }),
  ]);

  return { jobs, total };
}

export function findPublicJobByIdentifier(identifier, now = new Date(), database = prisma) {
  return database.job.findFirst({
    where: {
      status: 'PUBLISHED',
      moderationStatus: 'CLEARED',
      deadline: { gt: now },
      company: { is: { verificationStatus: 'VERIFIED' } },
      OR: [{ id: identifier }, { slug: identifier }],
    },
    select: jobRecordSelection,
  });
}
