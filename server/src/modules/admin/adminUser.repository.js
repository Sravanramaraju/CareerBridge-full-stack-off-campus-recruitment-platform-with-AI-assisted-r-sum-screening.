import { prisma } from '../../lib/database.js';

const adminUserSelection = {
  id: true,
  email: true,
  name: true,
  role: true,
  status: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
  _count: {
    select: { sessions: true, applications: true, companyMemberships: true },
  },
};

function buildAdminUserFilters({ q, role, status }) {
  return {
    ...(role ? { role } : {}),
    ...(status ? { status } : {}),
    ...(q ? {
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
      ],
    } : {}),
  };
}

export async function listAdminUsers(filters, database = prisma) {
  const where = buildAdminUserFilters(filters);
  const [users, total] = await Promise.all([
    database.user.findMany({
      where,
      select: adminUserSelection,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      skip: (filters.page - 1) * filters.pageSize,
      take: filters.pageSize,
    }),
    database.user.count({ where }),
  ]);
  return { users, total };
}

export function findAdminUser(userId, database = prisma) {
  return database.user.findUnique({ where: { id: userId }, select: adminUserSelection });
}

export function updateUserStatus(userId, currentStatus, nextStatus, database = prisma) {
  return database.user.updateMany({
    where: { id: userId, status: currentStatus },
    data: { status: nextStatus },
  });
}

export function revokeUserSessions(userId, database = prisma) {
  return database.session.deleteMany({ where: { userId } });
}
