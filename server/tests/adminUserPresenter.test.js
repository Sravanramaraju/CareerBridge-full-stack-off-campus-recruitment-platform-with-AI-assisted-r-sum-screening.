import { describe, expect, it } from 'vitest';
import { toAdminUser } from '../src/modules/admin/adminUser.presenter.js';

describe('admin user presenter', () => {
  it('presents role, status, and flattened activity counts without password data', () => {
    const date = new Date('2026-09-10T00:00:00.000Z');
    const result = toAdminUser({
      id: 'user-1', email: 'applicant@example.com', name: 'Applicant',
      passwordHash: 'never-expose', role: 'APPLICANT', status: 'SUSPENDED',
      _count: { sessions: 0, applications: 4, companyMemberships: 0 },
      lastLoginAt: date, createdAt: date, updatedAt: date,
    });
    expect(result).toMatchObject({
      id: 'user-1', roleLabel: 'Applicant', statusLabel: 'Suspended',
      activeSessionCount: 0, applicationCount: 4, companyMembershipCount: 0,
    });
    expect(result).not.toHaveProperty('passwordHash');
  });
});
