import { describe, expect, it, vi } from 'vitest';
import { getApplicantDashboardData } from '../src/modules/dashboard/applicantDashboard.repository.js';

describe('applicant dashboard repository', () => {
  it('loads bounded dashboard panels using applicant ownership and public job visibility', async () => {
    const profileFindUnique = vi.fn().mockResolvedValue({ id: 'profile-1' });
    const groupBy = vi.fn().mockResolvedValue([]);
    const applicationFindMany = vi.fn().mockResolvedValue([]);
    const savedFindMany = vi.fn().mockResolvedValue([]);
    const jobFindMany = vi.fn().mockResolvedValue([]);
    const notificationCount = vi.fn().mockResolvedValue(2);
    const now = new Date('2026-09-10T00:00:00.000Z');

    await getApplicantDashboardData('applicant-1', now, {
      applicantProfile: { findUnique: profileFindUnique },
      application: { groupBy, findMany: applicationFindMany },
      savedJob: { findMany: savedFindMany },
      job: { findMany: jobFindMany },
      notification: { count: notificationCount },
    });

    expect(groupBy).toHaveBeenCalledWith(expect.objectContaining({
      by: ['status'], where: { applicantId: 'applicant-1' },
    }));
    expect(applicationFindMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { applicantId: 'applicant-1' }, take: 3,
    }));
    expect(savedFindMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { applicantId: 'applicant-1' }, take: 2,
    }));
    expect(jobFindMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        status: 'PUBLISHED', moderationStatus: 'CLEARED', deadline: { gt: now },
        applications: { none: { applicantId: 'applicant-1' } },
      }),
      take: 4,
    }));
    expect(notificationCount).toHaveBeenCalledWith({
      where: { userId: 'applicant-1', readAt: null },
    });
  });
});
