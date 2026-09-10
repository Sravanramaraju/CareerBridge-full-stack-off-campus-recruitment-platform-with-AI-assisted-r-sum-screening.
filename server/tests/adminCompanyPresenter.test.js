import { describe, expect, it } from 'vitest';
import { toAdminCompany } from '../src/modules/admin/adminCompany.presenter.js';

describe('admin company presenter', () => {
  it('flattens moderation counts and includes stable status codes and labels', () => {
    expect(toAdminCompany({
      id: 'company-1', name: 'Northstar', slug: 'northstar', website: null,
      industry: 'Technology', companyType: 'Private', size: '51-200',
      headquarters: 'Bengaluru', verificationStatus: 'NEEDS_CHANGES', verifiedAt: null,
      _count: { members: 3, jobs: 5 },
      createdAt: new Date('2026-09-01'), updatedAt: new Date('2026-09-10'),
    })).toMatchObject({
      id: 'company-1', verificationStatus: 'NEEDS_CHANGES',
      verificationLabel: 'Needs changes', memberCount: 3, jobCount: 5,
    });
  });
});
