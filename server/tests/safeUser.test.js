import { describe, expect, it } from 'vitest';
import { toSafeUser } from '../src/modules/auth/safeUser.js';

describe('safe user serialization', () => {
  it('never exposes password hashes and includes role-specific context', () => {
    const serialized = toSafeUser({
      id: 'user-1',
      name: 'Rohan Mehta',
      email: 'rohan@example.com',
      role: 'RECRUITER',
      status: 'ACTIVE',
      passwordHash: 'must-never-leak',
      recruiterProfile: { id: 'recruiter-1' },
      companyMemberships: [
        {
          companyId: 'company-1',
          role: 'OWNER',
          company: { name: 'Northstar Labs', slug: 'northstar-labs', verificationStatus: 'VERIFIED' },
        },
      ],
    });

    expect(serialized).not.toHaveProperty('passwordHash');
    expect(serialized.context).toMatchObject({
      recruiterProfileId: 'recruiter-1',
      companies: [{ id: 'company-1', membershipRole: 'OWNER' }],
    });
  });
});
