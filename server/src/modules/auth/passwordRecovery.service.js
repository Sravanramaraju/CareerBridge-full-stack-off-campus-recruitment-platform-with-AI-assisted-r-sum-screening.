import { env } from '../../config/env.js';
import { prisma } from '../../lib/database.js';
import { createOpaqueToken, hashOpaqueToken } from '../../lib/tokens.js';
import { queueEmail } from '../email/emailOutbox.service.js';
import {
  createPasswordResetToken,
  expirePasswordResetTokens,
  findActiveUserForPasswordReset,
} from './auth.repository.js';

const MINUTE_IN_MILLISECONDS = 60 * 1_000;

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
