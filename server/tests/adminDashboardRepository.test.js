import { describe, expect, it, vi } from 'vitest';
import { getAdminDashboardMetrics } from '../src/modules/admin/adminDashboard.repository.js';

describe('admin dashboard repository', () => {
  it('loads real platform aggregates and recent moderation work', async () => {
    const userCount = vi.fn().mockResolvedValueOnce(100).mockResolvedValueOnce(70)
      .mockResolvedValueOnce(25);
    const companyCount = vi.fn().mockResolvedValue(5);
    const jobCount = vi.fn().mockResolvedValueOnce(30).mockResolvedValueOnce(2);
    const applicationCount = vi.fn().mockResolvedValue(240);
    const findMany = vi.fn().mockResolvedValue([{ id: 'audit-1' }]);
    const result = await getAdminDashboardMetrics({
      user: { count: userCount },
      company: { count: companyCount },
      job: { count: jobCount },
      application: { count: applicationCount },
      auditLog: { findMany },
    });
    expect(result).toMatchObject({
      totalUsers: 100, activeApplicants: 70, recruiters: 25, pendingCompanies: 5,
      publishedJobs: 30, flaggedJobs: 2, applications: 240,
      recentModeration: [{ id: 'audit-1' }],
    });
    expect(userCount).toHaveBeenNthCalledWith(2, {
      where: { role: 'APPLICANT', status: 'ACTIVE' },
    });
    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({ take: 10 }));
  });
});
