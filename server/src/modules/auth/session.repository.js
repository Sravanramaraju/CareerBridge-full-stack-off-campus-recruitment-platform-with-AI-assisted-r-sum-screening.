import { prisma } from '../../lib/database.js';

const sessionUserSelection = {
  id: true,
  name: true,
  email: true,
  role: true,
  status: true,
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

export function createSessionRecord(data, database = prisma) {
  return database.session.create({ data });
}

export function findActiveSession(tokenHash, now = new Date(), database = prisma) {
  return database.session.findFirst({
    where: {
      tokenHash,
      expiresAt: { gt: now },
      user: { status: 'ACTIVE' },
    },
    include: { user: { select: sessionUserSelection } },
  });
}

export function touchSession(sessionId, now = new Date(), database = prisma) {
  return database.session.update({ where: { id: sessionId }, data: { lastSeenAt: now } });
}

export function deleteSessionByTokenHash(tokenHash, database = prisma) {
  return database.session.deleteMany({ where: { tokenHash } });
}

export function deleteSessionsForUser(userId, database = prisma) {
  return database.session.deleteMany({ where: { userId } });
}

export function deleteExpiredSessions(now = new Date(), database = prisma) {
  return database.session.deleteMany({ where: { expiresAt: { lte: now } } });
}
