import { describe, expect, it, vi } from 'vitest';
import {
  createApplicantAccount,
  findUserForLogin,
  findUserIdByEmail,
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

  it('checks duplicate emails using an identifier-only query', async () => {
    const findUnique = vi.fn().mockResolvedValue(null);

    await findUserIdByEmail('user@example.com', { user: { findUnique } });

    expect(findUnique).toHaveBeenCalledWith({
      where: { email: 'user@example.com' },
      select: { id: true },
    });
  });

  it('creates applicant profile and preferences with the account', async () => {
    const create = vi.fn().mockResolvedValue({ id: 'user-1' });

    await createApplicantAccount(
      { name: 'Ananya Rao', email: 'ananya@example.com', passwordHash: 'hash' },
      { user: { create } },
    );

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          role: 'APPLICANT',
          applicantProfile: { create: {} },
          preference: { create: {} },
        }),
      }),
    );
  });
});
