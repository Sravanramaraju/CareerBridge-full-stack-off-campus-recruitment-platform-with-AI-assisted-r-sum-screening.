import { describe, expect, it, vi } from 'vitest';
import { hashOpaqueToken } from '../src/lib/tokens.js';
import {
  requestPasswordReset,
  resetPassword,
} from '../src/modules/auth/passwordRecovery.service.js';

describe('forgot-password service', () => {
  it('stores only a token hash and queues the protected delivery payload', async () => {
    const database = { marker: 'transaction-client' };
    const createToken = vi.fn().mockResolvedValue({ id: 'reset-1' });
    const enqueue = vi.fn().mockResolvedValue({ id: 'email-1' });
    const now = new Date('2026-09-09T00:00:00.000Z');

    const result = await requestPasswordReset('user@example.com', {
      runTransaction: (operation) => operation(database),
      findUser: vi.fn().mockResolvedValue({
        id: 'user-1',
        email: 'user@example.com',
        name: 'Ananya',
      }),
      expireTokens: vi.fn().mockResolvedValue({ count: 0 }),
      createToken,
      enqueue,
      tokenFactory: () => 'raw-reset-token',
      now: () => now,
    });

    expect(createToken).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        tokenHash: hashOpaqueToken('raw-reset-token'),
      }),
      database,
    );
    expect(JSON.stringify(createToken.mock.calls)).not.toContain('raw-reset-token');
    expect(enqueue).toHaveBeenCalledWith(
      expect.objectContaining({
        template: 'password-reset',
        payload: { name: 'Ananya', resetToken: 'raw-reset-token' },
      }),
      database,
    );
    expect(result).toEqual({ accepted: true });
  });

  it('returns the same accepted result for an unknown email', async () => {
    const createToken = vi.fn();
    const enqueue = vi.fn();

    const result = await requestPasswordReset('missing@example.com', {
      runTransaction: (operation) => operation({}),
      findUser: vi.fn().mockResolvedValue(null),
      createToken,
      enqueue,
    });

    expect(result).toEqual({ accepted: true });
    expect(createToken).not.toHaveBeenCalled();
    expect(enqueue).not.toHaveBeenCalled();
  });
});

describe('reset-password service', () => {
  it('changes the password, consumes tokens, and revokes every active session', async () => {
    const database = { marker: 'transaction-client' };
    const consumeToken = vi.fn().mockResolvedValue({ count: 1 });
    const updatePassword = vi.fn().mockResolvedValue({ id: 'user-1' });
    const expireTokens = vi.fn().mockResolvedValue({ count: 2 });
    const revokeSessions = vi.fn().mockResolvedValue({ count: 3 });
    const changedAt = new Date('2026-09-09T00:00:00.000Z');

    const result = await resetPassword(
      { token: 'raw-reset-token', password: 'new-secure-password' },
      {
        runTransaction: (operation) => operation(database),
        findToken: vi.fn().mockResolvedValue({
          id: 'reset-1',
          user: { id: 'user-1', status: 'ACTIVE' },
        }),
        consumeToken,
        updatePassword,
        expireTokens,
        revokeSessions,
        createPasswordHash: vi.fn().mockResolvedValue('argon2id-hash'),
        now: () => changedAt,
      },
    );

    expect(consumeToken).toHaveBeenCalledWith('reset-1', changedAt, database);
    expect(updatePassword).toHaveBeenCalledWith('user-1', 'argon2id-hash', database);
    expect(expireTokens).toHaveBeenCalledWith('user-1', changedAt, database);
    expect(revokeSessions).toHaveBeenCalledWith('user-1', database);
    expect(result).toEqual({ reset: true });
  });

  it('rejects an invalid token without changing authentication state', async () => {
    const updatePassword = vi.fn();
    const revokeSessions = vi.fn();

    await expect(
      resetPassword(
        { token: 'invalid-reset-token', password: 'new-secure-password' },
        {
          runTransaction: (operation) => operation({}),
          findToken: vi.fn().mockResolvedValue(null),
          updatePassword,
          revokeSessions,
          createPasswordHash: vi.fn().mockResolvedValue('argon2id-hash'),
        },
      ),
    ).rejects.toMatchObject({ code: 'INVALID_RESET_TOKEN', status: 400 });

    expect(updatePassword).not.toHaveBeenCalled();
    expect(revokeSessions).not.toHaveBeenCalled();
  });

  it('rejects a token if another request consumes it first', async () => {
    const updatePassword = vi.fn();

    await expect(
      resetPassword(
        { token: 'contended-reset-token', password: 'new-secure-password' },
        {
          runTransaction: (operation) => operation({}),
          findToken: vi.fn().mockResolvedValue({
            id: 'reset-1',
            user: { id: 'user-1', status: 'ACTIVE' },
          }),
          consumeToken: vi.fn().mockResolvedValue({ count: 0 }),
          updatePassword,
          createPasswordHash: vi.fn().mockResolvedValue('argon2id-hash'),
        },
      ),
    ).rejects.toMatchObject({ code: 'INVALID_RESET_TOKEN' });

    expect(updatePassword).not.toHaveBeenCalled();
  });
});
