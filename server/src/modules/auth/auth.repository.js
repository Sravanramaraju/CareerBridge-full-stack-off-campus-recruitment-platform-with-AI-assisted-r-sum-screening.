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

export function findUserIdByEmail(email, database = prisma) {
  return database.user.findUnique({ where: { email }, select: { id: true } });
}

export function createApplicantAccount({ name, email, passwordHash }, database = prisma) {
  return database.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: 'APPLICANT',
      applicantProfile: { create: {} },
      preference: { create: {} },
    },
    include: roleContextInclude,
  });
}

export function findCompanyIdBySlug(slug, database = prisma) {
  return database.company.findUnique({ where: { slug }, select: { id: true } });
}

export function createRecruiterAccount(
  { name, email, passwordHash, companyName, companySlug },
  database = prisma,
) {
  return database.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: 'RECRUITER',
      recruiterProfile: { create: {} },
      preference: { create: {} },
      companyMemberships: {
        create: {
          role: 'OWNER',
          company: {
            create: {
              name: companyName,
              slug: companySlug,
              verificationStatus: 'PENDING',
            },
          },
        },
      },
    },
    include: roleContextInclude,
  });
}
