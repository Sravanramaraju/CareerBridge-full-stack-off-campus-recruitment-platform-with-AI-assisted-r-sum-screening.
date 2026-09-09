import { describe, expect, it, vi } from 'vitest';
import {
  deleteSessionByTokenHash,
  findActiveSession,
} from '../src/modules/auth/session.repository.js';

describe('session repository', () => {
  it('only resolves unexpired sessions for active users', async () => {
    const findFirst = vi.fn().mockResolvedValue(null);
    const now = new Date('2026-09-09T00:00:00.000Z');

    await findActiveSession('hash', now, { session: { findFirst } });

    expect(findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          tokenHash: 'hash',
          expiresAt: { gt: now },
          user: { status: 'ACTIVE' },
        },
      }),
    );
  });

  it('deletes by token hash without throwing when no session exists', async () => {
    const deleteMany = vi.fn().mockResolvedValue({ count: 0 });

    await deleteSessionByTokenHash('hash', { session: { deleteMany } });

    expect(deleteMany).toHaveBeenCalledWith({ where: { tokenHash: 'hash' } });
  });
});
