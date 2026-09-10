import { prisma } from '../../lib/database.js';

const adminCompanySelection = {
  id: true,
  name: true,
  slug: true,
  website: true,
  industry: true,
  companyType: true,
  size: true,
  headquarters: true,
  verificationStatus: true,
  verifiedAt: true,
  createdAt: true,
  updatedAt: true,
  _count: { select: { members: true, jobs: true } },
};

function buildAdminCompanyFilters({ q, status }) {
  return {
    ...(status ? { verificationStatus: status } : {}),
    ...(q ? {
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { industry: { contains: q, mode: 'insensitive' } },
        { headquarters: { contains: q, mode: 'insensitive' } },
      ],
    } : {}),
  };
}

export async function listAdminCompanies(filters, database = prisma) {
  const where = buildAdminCompanyFilters(filters);
  const [companies, total] = await Promise.all([
    database.company.findMany({
      where,
      select: adminCompanySelection,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      skip: (filters.page - 1) * filters.pageSize,
      take: filters.pageSize,
    }),
    database.company.count({ where }),
  ]);
  return { companies, total };
}

export function findAdminCompany(companyId, database = prisma) {
  return database.company.findUnique({
    where: { id: companyId },
    select: adminCompanySelection,
  });
}

export function updateCompanyVerificationStatus(
  companyId,
  currentStatus,
  nextStatus,
  verifiedAt,
  database = prisma,
) {
  return database.company.updateMany({
    where: { id: companyId, verificationStatus: currentStatus },
    data: { verificationStatus: nextStatus, verifiedAt },
  });
}
