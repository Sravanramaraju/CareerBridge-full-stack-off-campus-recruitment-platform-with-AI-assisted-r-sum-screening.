import { describe, expect, it, vi } from 'vitest';
import { getAdminDashboard } from '../src/modules/admin/adminDashboard.service.js';

describe('admin dashboard service', () => {
  it('presents dashboard metrics separately from recent moderation activity', async () => {
    const generatedAt = new Date('2026-09-10T00:00:00.000Z');
    const loadMetrics = vi.fn().mockResolvedValue({
      totalUsers: 100,
      activeApplicants: 70,
      recruiters: 25,
      pendingCompanies: 5,
      publishedJobs: 30,
      flaggedJobs: 2,
      applications: 240,
      recentModeration: [{ id: 'audit-1' }],
    });
    await expect(getAdminDashboard({ loadMetrics, now: () => generatedAt })).resolves.toEqual({
      metrics: {
        totalUsers: 100,
        activeApplicants: 70,
        recruiters: 25,
        pendingCompanies: 5,
        publishedJobs: 30,
        flaggedJobs: 2,
        applications: 240,
      },
      recentModeration: [{ id: 'audit-1' }],
      generatedAt,
    });
    expect(loadMetrics).toHaveBeenCalledOnce();
  });
});
