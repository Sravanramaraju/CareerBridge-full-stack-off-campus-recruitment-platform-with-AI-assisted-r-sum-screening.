import { describe, expect, it, vi } from 'vitest';
import { getRecruiterJobApplications } from '../src/modules/applications/recruiterApplication.service.js';

const membership = { company: { id: 'company-1' } };
const now = new Date('2026-09-10T00:00:00.000Z');

function candidate(id, startDate) {
  return {
    id,
    jobId: 'job-1',
    resumeId: `resume-${id}`,
    status: 'APPLIED',
    appliedAt: now,
    updatedAt: now,
    applicant: {
      id: `applicant-${id}`,
      name: `Candidate ${id}`,
      email: `${id}@example.com`,
      applicantProfile: {
        headline: 'Engineer',
        location: 'Bengaluru',
        experiences: startDate ? [{ startDate, endDate: null, isCurrent: true }] : [],
        skills: [],
      },
    },
    match: { overallScore: 80 },
  };
}

describe('recruiter application service', () => {
  it('requires ownership before loading a candidate pipeline', async () => {
    await expect(getRecruiterJobApplications('recruiter-1', 'foreign-job', {
      minMatch: 0, page: 1, pageSize: 20,
    }, {
      findMembership: vi.fn().mockResolvedValue(membership),
      findJob: vi.fn().mockResolvedValue(null),
    })).rejects.toMatchObject({ code: 'NOT_FOUND', status: 404 });
  });

  it('filters calculated experience and paginates the resulting candidates', async () => {
    const filters = {
      minMatch: 0,
      minExperienceMonths: 12,
      page: 1,
      pageSize: 1,
    };
    const result = await getRecruiterJobApplications('recruiter-1', 'job-1', filters, {
      findMembership: vi.fn().mockResolvedValue(membership),
      findJob: vi.fn().mockResolvedValue({ id: 'job-1', title: 'Engineer' }),
      listCandidates: vi.fn().mockResolvedValue([
        candidate('experienced', new Date('2024-09-10')),
        candidate('fresher'),
      ]),
      now: () => now,
    });
    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toMatchObject({ applicationId: 'experienced', experienceMonths: 24 });
    expect(result.pagination).toEqual({
      page: 1,
      pageSize: 1,
      total: 1,
      totalPages: 1,
    });
  });

  it('requires an authenticated recruiter company membership', async () => {
    await expect(getRecruiterJobApplications('recruiter-1', 'job-1', {
      minMatch: 0, page: 1, pageSize: 20,
    }, {
      findMembership: vi.fn().mockResolvedValue(null),
    })).rejects.toMatchObject({ code: 'COMPANY_MEMBERSHIP_REQUIRED', status: 403 });
  });
});
