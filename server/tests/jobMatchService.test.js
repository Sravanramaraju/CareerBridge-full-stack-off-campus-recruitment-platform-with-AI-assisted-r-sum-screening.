import { describe, expect, it, vi } from 'vitest';
import { getApplicantJobMatch } from '../src/modules/matching/jobMatch.service.js';

const generatedAt = new Date('2026-09-10T12:00:00.000Z');
const job = { id: 'job-1', slug: 'graduate-engineer' };
const profile = { id: 'profile-1' };
const resume = {
  id: 'resume-1', originalFileName: 'resume.pdf', parseStatus: 'READY',
};

function dependencies(overrides = {}) {
  return {
    findJob: vi.fn().mockResolvedValue(job),
    findProfile: vi.fn().mockResolvedValue(profile),
    findResume: vi.fn().mockResolvedValue(resume),
    getSemanticScore: vi.fn().mockResolvedValue(78),
    calculateMatch: vi.fn().mockReturnValue({ overallScore: 83, semanticAvailable: true }),
    presentJob: vi.fn((value) => ({ id: value.id })),
    now: () => generatedAt,
    ...overrides,
  };
}

describe('applicant job match service', () => {
  it('calculates an applicant-specific hybrid match for a visible job', async () => {
    const mocks = dependencies();
    const result = await getApplicantJobMatch(
      'applicant-1', 'graduate-engineer', mocks,
    );

    expect(mocks.findJob).toHaveBeenCalledWith('graduate-engineer', generatedAt);
    expect(mocks.getSemanticScore).toHaveBeenCalledWith(job, resume);
    expect(mocks.calculateMatch).toHaveBeenCalledWith(job, profile, {
      semanticScore: 78,
      now: generatedAt,
    });
    expect(result).toEqual({
      job: { id: 'job-1' },
      match: { overallScore: 83, semanticAvailable: true },
      resume: { id: 'resume-1', originalFileName: 'resume.pdf', parseStatus: 'READY' },
      generatedAt,
    });
  });

  it('returns a structured-only match when no resume exists', async () => {
    const mocks = dependencies({ findResume: vi.fn().mockResolvedValue(null) });
    const result = await getApplicantJobMatch('applicant-1', 'job-1', mocks);
    expect(mocks.getSemanticScore).not.toHaveBeenCalled();
    expect(mocks.calculateMatch).toHaveBeenCalledWith(job, profile, {
      semanticScore: null,
      now: generatedAt,
    });
    expect(result.resume).toBeNull();
  });

  it('does not match jobs outside public visibility', async () => {
    await expect(getApplicantJobMatch('applicant-1', 'job-1', dependencies({
      findJob: vi.fn().mockResolvedValue(null),
    }))).rejects.toMatchObject({ code: 'NOT_FOUND', status: 404 });
  });

  it('requires an applicant profile', async () => {
    await expect(getApplicantJobMatch('applicant-1', 'job-1', dependencies({
      findProfile: vi.fn().mockResolvedValue(null),
    }))).rejects.toMatchObject({ code: 'NOT_FOUND', status: 404 });
  });
});
