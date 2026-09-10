import { describe, expect, it, vi } from 'vitest';
import { getApplicantRecommendations } from '../src/modules/matching/recommendation.service.js';

const generatedAt = new Date('2026-09-10T10:00:00.000Z');
const profile = { id: 'profile-1' };
const resume = { id: 'resume-1' };
const jobs = [
  { id: 'job-low', publishedAt: new Date('2026-09-09T00:00:00.000Z') },
  { id: 'job-high', publishedAt: new Date('2026-09-08T00:00:00.000Z') },
];

function dependencies(overrides = {}) {
  return {
    findProfile: vi.fn().mockResolvedValue(profile),
    findResume: vi.fn().mockResolvedValue(resume),
    listCandidates: vi.fn().mockResolvedValue(jobs),
    getSemanticScore: vi.fn()
      .mockResolvedValueOnce(25)
      .mockResolvedValueOnce(90),
    calculateMatch: vi.fn((_job, _profile, { semanticScore }) => ({
      overallScore: semanticScore,
      semanticScore,
      semanticAvailable: semanticScore !== null,
    })),
    presentJob: vi.fn((job) => job),
    now: () => generatedAt,
    ...overrides,
  };
}

describe('recommendation service', () => {
  it('sorts eligible jobs by hybrid score and returns bounded metadata', async () => {
    const mocks = dependencies();
    const result = await getApplicantRecommendations('applicant-1', { limit: 1 }, mocks);

    expect(mocks.listCandidates).toHaveBeenCalledWith('applicant-1', generatedAt, 20);
    expect(mocks.getSemanticScore).toHaveBeenCalledWith('job-low', 'resume-1');
    expect(mocks.calculateMatch).toHaveBeenCalledWith(jobs[1], profile, {
      semanticScore: 90,
      now: generatedAt,
    });
    expect(result.items).toEqual([{ job: jobs[1], match: expect.objectContaining({
      overallScore: 90,
    }) }]);
    expect(result.meta).toEqual({ limit: 1, candidateCount: 2, generatedAt });
  });

  it('uses structured matching when the applicant has no resume', async () => {
    const mocks = dependencies({ findResume: vi.fn().mockResolvedValue(null) });
    await getApplicantRecommendations('applicant-1', { limit: 12 }, mocks);
    expect(mocks.getSemanticScore).not.toHaveBeenCalled();
    expect(mocks.calculateMatch).toHaveBeenCalledWith(jobs[0], profile, {
      semanticScore: null,
      now: generatedAt,
    });
  });

  it('requires an applicant profile before calculating recommendations', async () => {
    await expect(getApplicantRecommendations('applicant-1', {}, dependencies({
      findProfile: vi.fn().mockResolvedValue(null),
    }))).rejects.toMatchObject({ code: 'NOT_FOUND', status: 404 });
  });
});
