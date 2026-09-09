import { describe, expect, it, vi } from 'vitest';
import { hashOpaqueToken } from '../src/lib/tokens.js';
import {
  issueSession,
  resolveSession,
  revokeSession,
} from '../src/modules/auth/session.service.js';

describe('session service', () => {
  it('persists only the hash of an issued session token', async () => {
    const createRecord = vi.fn().mockResolvedValue({ id: 'session-1' });
    const tokens = ['raw-session-token', 'raw-csrf-token'];
    const now = new Date('2026-09-09T00:00:00.000Z');

    const issued = await issueSession(
      { userId: 'user-1', rememberMe: false, userAgent: 'browser' },
      { createRecord, tokenFactory: () => tokens.shift(), now: () => now },
    );

    expect(issued).toMatchObject({
      token: 'raw-session-token',
      csrfToken: 'raw-csrf-token',
      session: { id: 'session-1' },
    });
    expect(createRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        tokenHash: hashOpaqueToken('raw-session-token'),
        userAgent: 'browser',
      }),
    );
  });

  it('returns null without querying when the cookie is absent', async () => {
    const findActive = vi.fn();

    await expect(resolveSession('', { findActive })).resolves.toBeNull();
    expect(findActive).not.toHaveBeenCalled();
  });

  it('refreshes last-seen only after the touch interval', async () => {
    const lastSeenAt = new Date('2026-09-09T00:00:00.000Z');
    const checkedAt = new Date('2026-09-09T00:06:00.000Z');
    const findActive = vi.fn().mockResolvedValue({ id: 'session-1', lastSeenAt });
    const touch = vi.fn().mockResolvedValue({});

    await resolveSession('raw-token', { findActive, touch, now: () => checkedAt });

    expect(touch).toHaveBeenCalledWith('session-1', checkedAt);
  });

  it('revokes the database record by hashed token', async () => {
    const remove = vi.fn().mockResolvedValue({ count: 1 });

    await revokeSession('raw-token', { remove });

    expect(remove).toHaveBeenCalledWith(hashOpaqueToken('raw-token'));
  });
});
