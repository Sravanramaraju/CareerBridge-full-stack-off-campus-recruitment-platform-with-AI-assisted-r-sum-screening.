import { describe, expect, it, vi } from 'vitest';
import { listRecommendationCandidates } from '../src/modules/matching/recommendation.repository.js';

describe('recommendation repository', () => {
  it('loads a bounded pool of visible jobs the applicant has not applied to', async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    const now = new Date('2026-09-10T00:00:00.000Z');

    await listRecommendationCandidates('applicant-1', now, 24, { job: { findMany } });

    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: {
        status: 'PUBLISHED',
        moderationStatus: 'CLEARED',
        deadline: { gt: now },
        company: { is: { verificationStatus: 'VERIFIED' } },
        applications: { none: { applicantId: 'applicant-1' } },
      },
      orderBy: [{ featured: 'desc' }, { publishedAt: 'desc' }, { id: 'asc' }],
      take: 24,
      select: expect.objectContaining({ company: expect.any(Object), skills: expect.any(Object) }),
    }));
  });
});
