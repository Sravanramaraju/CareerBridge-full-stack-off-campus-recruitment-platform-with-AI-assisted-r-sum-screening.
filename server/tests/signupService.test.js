import { describe, expect, it, vi } from 'vitest';
import { registerApplicant } from '../src/modules/auth/signup.service.js';

function applicantAccount() {
  return {
    id: 'applicant-1',
    name: 'Ananya Rao',
    email: 'ananya@example.com',
    role: 'APPLICANT',
    status: 'ACTIVE',
    passwordHash: 'hash',
    applicantProfile: { id: 'profile-1' },
    companyMemberships: [],
  };
}

describe('applicant registration', () => {
  it('creates the account and session inside one transaction', async () => {
    const database = { marker: 'transaction-client' };
    const createAccount = vi.fn().mockResolvedValue(applicantAccount());
    const createSession = vi.fn().mockResolvedValue({ token: 'raw-token' });

    const result = await registerApplicant(
      {
        name: 'Ananya Rao',
        email: 'ananya@example.com',
        password: 'password',
        userAgent: 'browser',
      },
      {
        hash: vi.fn().mockResolvedValue('hash'),
        runTransaction: (operation) => operation(database),
        findExisting: vi.fn().mockResolvedValue(null),
        createAccount,
        createSession,
      },
    );

    expect(createAccount).toHaveBeenCalledWith(
      { name: 'Ananya Rao', email: 'ananya@example.com', passwordHash: 'hash' },
      database,
    );
    expect(createSession).toHaveBeenCalledWith(
      { userId: 'applicant-1', rememberMe: false, userAgent: 'browser' },
      expect.objectContaining({ createRecord: expect.any(Function) }),
    );
    expect(result.user).not.toHaveProperty('passwordHash');
  });

  it('rejects duplicate email addresses before creating an account', async () => {
    const createAccount = vi.fn();

    await expect(
      registerApplicant(
        { name: 'Ananya Rao', email: 'ananya@example.com', password: 'password' },
        {
          hash: vi.fn().mockResolvedValue('hash'),
          runTransaction: (operation) => operation({}),
          findExisting: vi.fn().mockResolvedValue({ id: 'existing' }),
          createAccount,
        },
      ),
    ).rejects.toMatchObject({ code: 'EMAIL_IN_USE', status: 409 });
    expect(createAccount).not.toHaveBeenCalled();
  });
});
