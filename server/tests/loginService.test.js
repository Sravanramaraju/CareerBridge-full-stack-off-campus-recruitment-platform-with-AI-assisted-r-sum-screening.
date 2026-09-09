import { describe, expect, it, vi } from 'vitest';
import { login } from '../src/modules/auth/login.service.js';

function activeUser(overrides = {}) {
  return {
    id: 'user-1',
    name: 'Ananya Rao',
    email: 'ananya@example.com',
    passwordHash: 'stored-hash',
    role: 'APPLICANT',
    status: 'ACTIVE',
    companyMemberships: [],
    ...overrides,
  };
}

describe('login service', () => {
  it('verifies credentials and issues the requested session lifetime', async () => {
    const user = activeUser();
    const createSession = vi.fn().mockResolvedValue({ token: 'raw-token' });

    const result = await login(
      {
        email: user.email,
        password: 'password',
        rememberMe: true,
        userAgent: 'browser',
      },
      {
        findUser: vi.fn().mockResolvedValue(user),
        verify: vi.fn().mockResolvedValue(true),
        recordLogin: vi.fn().mockResolvedValue(user),
        createSession,
      },
    );

    expect(createSession).toHaveBeenCalledWith({
      userId: 'user-1',
      rememberMe: true,
      userAgent: 'browser',
    });
    expect(result.user).not.toHaveProperty('passwordHash');
  });

  it('returns the same generic failure for an unknown email', async () => {
    await expect(
      login(
        { email: 'missing@example.com', password: 'password', rememberMe: false },
        {
          findUser: vi.fn().mockResolvedValue(null),
          verify: vi.fn().mockResolvedValue(false),
        },
      ),
    ).rejects.toMatchObject({ code: 'INVALID_CREDENTIALS', status: 401 });
  });

  it('does not allow suspended users to create sessions', async () => {
    const createSession = vi.fn();

    await expect(
      login(
        { email: 'user@example.com', password: 'password', rememberMe: false },
        {
          findUser: vi.fn().mockResolvedValue(activeUser({ status: 'SUSPENDED' })),
          verify: vi.fn().mockResolvedValue(true),
          createSession,
        },
      ),
    ).rejects.toMatchObject({ code: 'INVALID_CREDENTIALS', status: 401 });
    expect(createSession).not.toHaveBeenCalled();
  });
});
