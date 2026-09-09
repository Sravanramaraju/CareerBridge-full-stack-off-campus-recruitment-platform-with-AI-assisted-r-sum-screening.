import { createOpaqueToken, hashOpaqueToken } from '../../lib/tokens.js';
import {
  createSessionRecord,
  deleteSessionByTokenHash,
  findActiveSession,
  touchSession,
} from './session.repository.js';
import { getSessionExpiry } from './sessionLifetime.js';

const SESSION_TOUCH_INTERVAL_MS = 5 * 60 * 1_000;

export async function issueSession(
  { userId, rememberMe, userAgent },
  {
    createRecord = createSessionRecord,
    tokenFactory = createOpaqueToken,
    now = () => new Date(),
  } = {},
) {
  const issuedAt = now();
  const token = tokenFactory();
  const csrfToken = tokenFactory();
  const expiresAt = getSessionExpiry(rememberMe, issuedAt);
  const session = await createRecord({
    userId,
    tokenHash: hashOpaqueToken(token),
    expiresAt,
    lastSeenAt: issuedAt,
    userAgent: userAgent?.slice(0, 512) || null,
  });

  return { session, token, csrfToken, expiresAt };
}

export async function resolveSession(
  token,
  { findActive = findActiveSession, touch = touchSession, now = () => new Date() } = {},
) {
  if (!token) return null;

  const checkedAt = now();
  const session = await findActive(hashOpaqueToken(token), checkedAt);

  if (!session) return null;

  if (checkedAt.getTime() - session.lastSeenAt.getTime() >= SESSION_TOUCH_INTERVAL_MS) {
    await touch(session.id, checkedAt);
  }

  return session;
}

export function revokeSession(token, { remove = deleteSessionByTokenHash } = {}) {
  if (!token) return Promise.resolve({ count: 0 });
  return remove(hashOpaqueToken(token));
}
