import { prisma } from '../../lib/database.js';

const accountSelection = {
  id: true,
  name: true,
  email: true,
  preference: {
    select: {
      applicationUpdates: true,
      newApplications: true,
    },
  },
};

export function findApplicantNotificationAccount(applicantId, database = prisma) {
  return database.user.findFirst({
    where: { id: applicantId, role: 'APPLICANT', status: 'ACTIVE' },
    select: accountSelection,
  });
}

export function listCompanyRecruiterNotificationAccounts(companyId, database = prisma) {
  return database.companyMember.findMany({
    where: {
      companyId,
      user: { is: { role: 'RECRUITER', status: 'ACTIVE' } },
    },
    orderBy: [{ joinedAt: 'asc' }, { userId: 'asc' }],
    select: { user: { select: accountSelection } },
  });
}
