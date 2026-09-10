import { describe, expect, it, vi } from 'vitest';
import {
  getRecruiterApplication,
  getRecruiterJobApplications,
} from '../src/modules/applications/recruiterApplication.service.js';

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

  it('returns complete application detail only through recruiter company ownership', async () => {
    const raw = candidate('detail', new Date('2025-09-10'));
    raw.coverNote = null;
    raw.job = { id: 'job-1', title: 'Engineer', company: { id: 'company-1' } };
    raw.resume = {
      id: 'resume-1', originalFileName: 'resume.pdf', mimeType: 'application/pdf',
      fileSize: 1_024, parseStatus: 'READY', createdAt: now,
    };
    raw.applicant.applicantProfile = {
      ...raw.applicant.applicantProfile,
      summary: 'Candidate summary',
      preferredLocations: [], preferredJobTypes: [], preferredWorkModes: [],
      applicantEducations: [], projects: [], certifications: [],
    };
    raw.screeningAnswers = [];
    raw.statusHistory = [];
    raw.recruiterNotes = [];
    const findApplication = vi.fn().mockResolvedValue(raw);

    await expect(getRecruiterApplication('recruiter-1', 'application-1', {
      findMembership: vi.fn().mockResolvedValue(membership),
      findApplication,
      now: () => now,
    })).resolves.toMatchObject({ applicationId: 'detail', summary: 'Candidate summary' });
    expect(findApplication).toHaveBeenCalledWith('application-1', 'company-1');
  });

  it('uses a generic not-found result for another company application', async () => {
    await expect(getRecruiterApplication('recruiter-1', 'foreign-application', {
      findMembership: vi.fn().mockResolvedValue(membership),
      findApplication: vi.fn().mockResolvedValue(null),
    })).rejects.toMatchObject({ code: 'NOT_FOUND', status: 404 });
  });
});
