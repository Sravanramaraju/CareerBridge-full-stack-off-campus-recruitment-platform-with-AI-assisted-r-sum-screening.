import { describe, expect, it, vi } from 'vitest';
import { getRecruiterDashboardData } from '../src/modules/dashboard/recruiterDashboard.repository.js';

describe('recruiter dashboard repository', () => {
  it('loads bounded recruiter dashboard data through company ownership', async () => {
    const jobGroupBy = vi.fn().mockResolvedValue([]);
    const applicationGroupBy = vi.fn().mockResolvedValue([]);
    const applicationFindMany = vi.fn().mockResolvedValue([]);
    const jobFindMany = vi.fn().mockResolvedValue([]);
    const jobCount = vi.fn().mockResolvedValue(2);
    const notificationCount = vi.fn().mockResolvedValue(0);
    const now = new Date('2026-09-10T00:00:00.000Z');
    await getRecruiterDashboardData('recruiter-1', 'company-1', now, {
      job: { groupBy: jobGroupBy, findMany: jobFindMany, count: jobCount },
      application: { groupBy: applicationGroupBy, findMany: applicationFindMany },
      notification: { count: notificationCount },
    });
    expect(jobGroupBy).toHaveBeenCalledWith({
      by: ['status'], where: { companyId: 'company-1' }, _count: { _all: true },
    });
    expect(applicationGroupBy).toHaveBeenCalledWith(expect.objectContaining({
      where: { job: { is: { companyId: 'company-1' } } },
    }));
    expect(applicationFindMany).toHaveBeenCalledWith(expect.objectContaining({ take: 5 }));
    expect(jobFindMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { companyId: 'company-1', status: 'PUBLISHED' }, take: 4,
    }));
    expect(jobCount.mock.calls[0][0].where.deadline).toEqual({
      gt: now, lte: new Date('2026-09-24T00:00:00.000Z'),
    });
    expect(notificationCount).toHaveBeenCalledWith({
      where: { userId: 'recruiter-1', readAt: null },
    });
  });
});
