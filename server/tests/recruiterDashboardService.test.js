import { describe, expect, it, vi } from 'vitest';
import { getRecruiterDashboard } from '../src/modules/dashboard/recruiterDashboard.service.js';

const database = { marker: 'transaction-client' };
const now = new Date('2026-09-10T00:00:00.000Z');

describe('recruiter dashboard service', () => {
  it('composes company-owned hiring metrics, pipeline, and attention items', async () => {
    const loadDashboard = vi.fn().mockResolvedValue({
      jobCounts: [
        { status: 'PUBLISHED', _count: { _all: 3 } },
        { status: 'DRAFT', _count: { _all: 1 } },
      ],
      stageCounts: [
        { status: 'APPLIED', _count: { _all: 2 } },
        { status: 'UNDER_REVIEW', _count: { _all: 4 } },
        { status: 'SHORTLISTED', _count: { _all: 1 } },
      ],
      recentCandidates: [], activeJobs: [], closingSoon: 2, unreadCount: 5,
    });
    const membership = {
      company: { id: 'company-1', name: 'Northstar', verificationStatus: 'VERIFIED' },
    };
    const result = await getRecruiterDashboard('recruiter-1', {
      runTransaction: (operation) => operation(database),
      findMembership: vi.fn().mockResolvedValue(membership),
      loadDashboard,
      now: () => now,
    });
    expect(loadDashboard).toHaveBeenCalledWith('recruiter-1', 'company-1', now, database);
    expect(result).toMatchObject({
      metrics: {
        activeJobs: 3, draftJobs: 1, newApplications: 6, shortlisted: 1, interviews: 0,
      },
      stageDistribution: { APPLIED: 2, UNDER_REVIEW: 4, INTERVIEW: 0 },
      attention: { draftJobs: 1, closingSoon: 2, awaitingInitialReview: 2 },
      notifications: { unreadCount: 5 },
      generatedAt: now,
    });
  });

  it('requires an authenticated recruiter company membership', async () => {
    await expect(getRecruiterDashboard('recruiter-1', {
      runTransaction: (operation) => operation(database),
      findMembership: vi.fn().mockResolvedValue(null),
    })).rejects.toMatchObject({ code: 'COMPANY_MEMBERSHIP_REQUIRED', status: 403 });
  });
});
