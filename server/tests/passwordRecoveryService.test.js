import { describe, expect, it, vi } from 'vitest';
import { hashOpaqueToken } from '../src/lib/tokens.js';
import { requestPasswordReset } from '../src/modules/auth/passwordRecovery.service.js';

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
