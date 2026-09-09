import { prisma } from '../../lib/database.js';

const roleContextInclude = {
  applicantProfile: { select: { id: true } },
  recruiterProfile: { select: { id: true } },
  companyMemberships: {
    select: {
      companyId: true,
      role: true,
      company: { select: { name: true, slug: true, verificationStatus: true } },
    },
  },
};

export function findUserForLogin(email, database = prisma) {
  return database.user.findUnique({
    where: { email },
    include: roleContextInclude,
  });
}

export function recordSuccessfulLogin(userId, lastLoginAt, database = prisma) {
  return database.user.update({
    where: { id: userId },
    data: { lastLoginAt },
    include: roleContextInclude,
  });
}
