import { describe, expect, it, vi } from 'vitest';
import {
  getApplicantApplication,
  getApplicantApplications,
} from '../src/modules/applications/applicantApplication.service.js';

const rawApplication = {
  id: 'application-1',
  applicantId: 'applicant-1',
  jobId: 'job-1',
  resumeId: 'resume-1',
  coverNote: null,
  status: 'APPLIED',
  appliedAt: new Date('2026-09-10'),
  updatedAt: new Date('2026-09-10'),
  job: {
    id: 'job-1', status: 'PUBLISHED', workMode: 'REMOTE', employmentType: 'FULL_TIME',
    experienceMin: 0, experienceMax: 0, salaryMin: null, salaryMax: null,
    currency: 'INR', hideSalary: false, publishedAt: new Date('2026-09-01'), skills: [],
    company: {
      name: 'Northstar Labs', brandInitials: 'NL', brandColor: '#2658d8',
      verificationStatus: 'VERIFIED',
    },
  },
  resume: {
    id: 'resume-1', originalFileName: 'resume.pdf', mimeType: 'application/pdf',
    fileSize: 1_024, parseStatus: 'READY', createdAt: new Date('2026-09-01'),
  },
  screeningAnswers: [],
  statusHistory: [],
};

describe('applicant application service', () => {
  it('returns presented applications owned by the current applicant', async () => {
    const listApplications = vi.fn().mockResolvedValue([rawApplication]);
    const result = await getApplicantApplications('applicant-1', { listApplications });
    expect(listApplications).toHaveBeenCalledWith('applicant-1');
    expect(result).toEqual([expect.objectContaining({ id: 'application-1', status: 'Applied' })]);
  });

  it('returns one presented owned application', async () => {
    const findApplication = vi.fn().mockResolvedValue(rawApplication);
    await expect(getApplicantApplication('applicant-1', 'application-1', { findApplication }))
      .resolves.toMatchObject({ id: 'application-1', resume: { name: 'resume.pdf' } });
    expect(findApplication).toHaveBeenCalledWith('application-1', 'applicant-1');
  });

  it('uses a generic not-found response for foreign applications', async () => {
    await expect(getApplicantApplication('applicant-1', 'foreign-application', {
      findApplication: vi.fn().mockResolvedValue(null),
    })).rejects.toMatchObject({ code: 'NOT_FOUND', status: 404 });
  });
});
