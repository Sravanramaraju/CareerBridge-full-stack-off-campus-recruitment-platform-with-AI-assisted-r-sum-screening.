import { describe, expect, it, vi } from 'vitest';
import {
  createApplicantAccount,
  createRecruiterAccount,
  createPasswordResetToken,
  expirePasswordResetTokens,
  findCompanyIdBySlug,
  findValidPasswordResetToken,
  findUserForLogin,
  findUserIdByEmail,
  markPasswordResetTokenUsed,
  recordSuccessfulLogin,
  updateUserPassword,
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

  it('checks public company slug collisions', async () => {
    const findUnique = vi.fn().mockResolvedValue(null);

    await findCompanyIdBySlug('northstar-labs', { company: { findUnique } });

    expect(findUnique).toHaveBeenCalledWith({
      where: { slug: 'northstar-labs' },
      select: { id: true },
    });
  });

  it('creates a pending company owned by the signing recruiter', async () => {
    const create = vi.fn().mockResolvedValue({ id: 'recruiter-1' });

    await createRecruiterAccount(
      {
        name: 'Rohan Mehta',
        email: 'rohan@example.com',
        passwordHash: 'hash',
        companyName: 'Northstar Labs',
        companySlug: 'northstar-labs',
      },
      { user: { create } },
    );

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          role: 'RECRUITER',
          recruiterProfile: { create: {} },
          companyMemberships: {
            create: expect.objectContaining({
              role: 'OWNER',
              company: {
                create: expect.objectContaining({ verificationStatus: 'PENDING' }),
              },
            }),
          },
        }),
      }),
    );
  });

  it('expires prior unused password reset tokens', async () => {
    const updateMany = vi.fn().mockResolvedValue({ count: 1 });
    const usedAt = new Date('2026-09-09T00:00:00.000Z');

    await expirePasswordResetTokens('user-1', usedAt, { passwordResetToken: { updateMany } });

    expect(updateMany).toHaveBeenCalledWith({
      where: { userId: 'user-1', usedAt: null },
      data: { usedAt },
    });
  });

  it('stores reset-token hashes and expiry metadata', async () => {
    const create = vi.fn().mockResolvedValue({ id: 'reset-1' });
    const data = {
      userId: 'user-1',
      tokenHash: 'hash',
      expiresAt: new Date('2026-09-09T00:30:00.000Z'),
    };

    await createPasswordResetToken(data, { passwordResetToken: { create } });

    expect(create).toHaveBeenCalledWith({ data });
  });

  it('only resolves unused and unexpired reset tokens', async () => {
    const findFirst = vi.fn().mockResolvedValue(null);
    const now = new Date('2026-09-09T00:00:00.000Z');

    await findValidPasswordResetToken('hash', now, { passwordResetToken: { findFirst } });

    expect(findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tokenHash: 'hash', usedAt: null, expiresAt: { gt: now } },
      }),
    );
  });

  it('atomically consumes only an unused and unexpired reset token', async () => {
    const updateMany = vi.fn().mockResolvedValue({ count: 1 });
    const usedAt = new Date('2026-09-09T00:00:00.000Z');

    await markPasswordResetTokenUsed('reset-1', usedAt, {
      passwordResetToken: { updateMany },
    });

    expect(updateMany).toHaveBeenCalledWith({
      where: { id: 'reset-1', usedAt: null, expiresAt: { gt: usedAt } },
      data: { usedAt },
    });
  });

  it('updates a user password using only the supplied hash', async () => {
    const update = vi.fn().mockResolvedValue({ id: 'user-1' });

    await updateUserPassword('user-1', 'argon2id-hash', { user: { update } });

    expect(update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { passwordHash: 'argon2id-hash' },
    });
  });
});
