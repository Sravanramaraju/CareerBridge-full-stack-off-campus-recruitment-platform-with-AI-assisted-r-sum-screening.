import { env } from '../../config/env.js';
import { AppError } from '../../lib/appError.js';
import { prisma } from '../../lib/database.js';
import { hashPassword } from '../../lib/password.js';
import { createOpaqueToken, hashOpaqueToken } from '../../lib/tokens.js';
import { queueEmail } from '../email/emailOutbox.service.js';
import {
  createPasswordResetToken,
  expirePasswordResetTokens,
  findActiveUserForPasswordReset,
  findValidPasswordResetToken,
  markPasswordResetTokenUsed,
  updateUserPassword,
} from './auth.repository.js';
import { deleteSessionsForUser } from './session.repository.js';

const MINUTE_IN_MILLISECONDS = 60 * 1_000;

function invalidResetTokenError() {
  return new AppError({
    code: 'INVALID_RESET_TOKEN',
    message: 'This password reset link is invalid or has expired.',
    status: 400,
  });
}

export async function requestPasswordReset(
  email,
  {
    runTransaction = (operation) => prisma.$transaction(operation),
    findUser = findActiveUserForPasswordReset,
    expireTokens = expirePasswordResetTokens,
    createToken = createPasswordResetToken,
    enqueue = queueEmail,
    tokenFactory = createOpaqueToken,
    now = () => new Date(),
  } = {},
) {
  await runTransaction(async (database) => {
    const user = await findUser(email, database);
    if (!user) return;

    const createdAt = now();
    const rawToken = tokenFactory();
    const expiresAt = new Date(
      createdAt.getTime() + env.PASSWORD_RESET_TTL_MINUTES * MINUTE_IN_MILLISECONDS,
    );

    await expireTokens(user.id, createdAt, database);
    await createToken(
      { userId: user.id, tokenHash: hashOpaqueToken(rawToken), expiresAt },
      database,
    );
    await enqueue(
      {
        recipient: user.email,
        subject: 'Reset your CareerBridge password',
        template: 'password-reset',
        payload: { name: user.name, resetToken: rawToken },
      },
      database,
    );
  });

  return { accepted: true };
}

export async function resetPassword(
  { token, password },
  {
    runTransaction = (operation) => prisma.$transaction(operation),
    findToken = findValidPasswordResetToken,
    consumeToken = markPasswordResetTokenUsed,
    updatePassword = updateUserPassword,
    expireTokens = expirePasswordResetTokens,
    revokeSessions = deleteSessionsForUser,
    createPasswordHash = hashPassword,
    now = () => new Date(),
  } = {},
) {
  const tokenHash = hashOpaqueToken(token);
  const passwordHash = await createPasswordHash(password);

  await runTransaction(async (database) => {
    const changedAt = now();
    const resetToken = await findToken(tokenHash, changedAt, database);

    if (!resetToken || resetToken.user.status !== 'ACTIVE') {
      throw invalidResetTokenError();
    }

    const consumed = await consumeToken(resetToken.id, changedAt, database);
    if (consumed.count !== 1) {
      throw invalidResetTokenError();
    }

    await updatePassword(resetToken.user.id, passwordHash, database);
    await expireTokens(resetToken.user.id, changedAt, database);
    await revokeSessions(resetToken.user.id, database);
  });

  return { reset: true };
}
