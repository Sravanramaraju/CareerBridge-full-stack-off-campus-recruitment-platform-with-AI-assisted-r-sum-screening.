import { prisma } from '../../lib/database.js';

export function enqueueEmail({ recipient, subject, template, payload }, database = prisma) {
  return database.emailOutbox.create({
    data: { recipient, subject, template, payload },
  });
}

export function findPendingEmails({ now = new Date(), limit = 10 } = {}, database = prisma) {
  return database.emailOutbox.findMany({
    where: { status: 'PENDING', nextAttemptAt: { lte: now } },
    orderBy: { createdAt: 'asc' },
    take: limit,
  });
}

export function claimEmail(emailId, now = new Date(), database = prisma) {
  return database.emailOutbox.updateMany({
    where: { id: emailId, status: 'PENDING', nextAttemptAt: { lte: now } },
    data: { status: 'PROCESSING', lockedAt: now, attemptCount: { increment: 1 } },
  });
}

export function markEmailSent(emailId, sentAt = new Date(), database = prisma) {
  return database.emailOutbox.update({
    where: { id: emailId },
    data: { status: 'SENT', sentAt, lockedAt: null, lastError: null },
  });
}

export function markEmailFailed(
  emailId,
  { status, lastError, nextAttemptAt },
  database = prisma,
) {
  return database.emailOutbox.update({
    where: { id: emailId },
    data: { status, lastError, nextAttemptAt, lockedAt: null },
  });
}
