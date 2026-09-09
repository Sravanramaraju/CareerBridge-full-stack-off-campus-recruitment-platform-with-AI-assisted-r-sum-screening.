import { prisma } from '../../lib/database.js';

function publicCompanySelection(now) {
  return {
    id: true,
    name: true,
    slug: true,
    description: true,
    website: true,
    industry: true,
    companyType: true,
    size: true,
    foundedYear: true,
    headquarters: true,
    locations: true,
    benefits: true,
    logoUrl: true,
    brandInitials: true,
    brandColor: true,
    verificationStatus: true,
    verifiedAt: true,
    _count: {
      select: {
        jobs: {
          where: {
            status: 'PUBLISHED',
            moderationStatus: 'CLEARED',
            deadline: { gt: now },
          },
        },
      },
    },
  };
}

const recruiterCompanySelection = {
  id: true,
  name: true,
  slug: true,
  description: true,
  website: true,
  industry: true,
  companyType: true,
  size: true,
  foundedYear: true,
  headquarters: true,
  locations: true,
  benefits: true,
  logoUrl: true,
  brandInitials: true,
  brandColor: true,
  verificationStatus: true,
  verifiedAt: true,
  createdAt: true,
  updatedAt: true,
};

function buildCompanyFilters({ q, industry, size, location, companyType }) {
  return {
    verificationStatus: 'VERIFIED',
    ...(industry ? { industry } : {}),
    ...(size ? { size } : {}),
    ...(companyType ? { companyType } : {}),
    ...(location
      ? {
          OR: [
            { headquarters: { startsWith: location, mode: 'insensitive' } },
            { locations: { has: location } },
          ],
        }
      : {}),
    ...(q
      ? {
          AND: [
            {
              OR: [
                { name: { contains: q, mode: 'insensitive' } },
                { industry: { contains: q, mode: 'insensitive' } },
                { headquarters: { contains: q, mode: 'insensitive' } },
              ],
            },
          ],
        }
      : {}),
  };
}

export async function listPublicCompanies(filters, now = new Date(), database = prisma) {
  const where = buildCompanyFilters(filters);
  const [companies, total] = await Promise.all([
    database.company.findMany({
      where,
      select: publicCompanySelection(now),
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
      skip: (filters.page - 1) * filters.pageSize,
      take: filters.pageSize,
    }),
    database.company.count({ where }),
  ]);

  return { companies, total };
}

export function findPublicCompanyByIdentifier(identifier, now = new Date(), database = prisma) {
  return database.company.findFirst({
    where: {
      verificationStatus: 'VERIFIED',
      OR: [{ id: identifier }, { slug: identifier }],
    },
    select: publicCompanySelection(now),
  });
}

export function findCompanyMembershipForUser(userId, database = prisma) {
  return database.companyMember.findFirst({
    where: { userId },
    orderBy: [{ joinedAt: 'asc' }, { companyId: 'asc' }],
    select: {
      role: true,
      joinedAt: true,
      company: {
        select: recruiterCompanySelection,
      },
    },
  });
}

export function updateCompanyRecord(companyId, updates, database = prisma) {
  return database.company.update({
    where: { id: companyId },
    data: updates,
    select: recruiterCompanySelection,
  });
}
