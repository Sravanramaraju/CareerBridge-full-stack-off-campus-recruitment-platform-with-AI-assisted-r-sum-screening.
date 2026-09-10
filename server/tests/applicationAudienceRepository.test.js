import { describe, expect, it, vi } from 'vitest';
import {
  findApplicantNotificationAccount,
  listCompanyRecruiterNotificationAccounts,
} from '../src/modules/applications/applicationAudience.repository.js';

describe('application notification audience repository', () => {
  it('loads an active applicant with communication preferences', async () => {
    const findFirst = vi.fn().mockResolvedValue(null);
    await findApplicantNotificationAccount('applicant-1', { user: { findFirst } });
    expect(findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'applicant-1', role: 'APPLICANT', status: 'ACTIVE' },
      select: expect.objectContaining({
        email: true,
        preference: { select: expect.objectContaining({ applicationUpdates: true }) },
      }),
    }));
  });

  it('loads only active recruiter accounts belonging to the job company', async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    await listCompanyRecruiterNotificationAccounts('company-1', {
      companyMember: { findMany },
    });
    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: {
        companyId: 'company-1',
        user: { is: { role: 'RECRUITER', status: 'ACTIVE' } },
      },
      orderBy: [{ joinedAt: 'asc' }, { userId: 'asc' }],
    }));
  });
});
