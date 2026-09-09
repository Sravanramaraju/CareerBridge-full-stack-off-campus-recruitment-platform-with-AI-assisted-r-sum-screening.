import { describe, expect, it, vi } from 'vitest';
import {
  findUserForLogin,
  recordSuccessfulLogin,
} from '../src/modules/auth/auth.repository.js';

describe('authentication repository', () => {
  it('looks up the canonical normalized email', async () => {
    const findUnique = vi.fn().mockResolvedValue(null);

    await findUserForLogin('user@example.com', { user: { findUnique } });

    expect(findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { email: 'user@example.com' } }),
    );
  });

  it('records successful login time and reloads role context', async () => {
    const update = vi.fn().mockResolvedValue({ id: 'user-1' });
    const lastLoginAt = new Date('2026-09-09T00:00:00.000Z');

    await recordSuccessfulLogin('user-1', lastLoginAt, { user: { update } });

    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'user-1' },
        data: { lastLoginAt },
      }),
    );
  });
});
