import { describe, expect, it } from 'vitest';
import { toApplicantApplication } from '../src/modules/applications/application.presenter.js';

const application = {
  id: 'application-1',
  jobId: 'job-1',
  resumeId: 'resume-1',
  coverNote: 'Excited to contribute.',
  status: 'UNDER_REVIEW',
  appliedAt: new Date('2026-09-01T00:00:00.000Z'),
  updatedAt: new Date('2026-09-02T00:00:00.000Z'),
  job: {
    id: 'job-1', status: 'CLOSED', workMode: 'REMOTE', employmentType: 'FULL_TIME',
    experienceMin: 0, experienceMax: 1, salaryMin: null, salaryMax: null,
    currency: 'INR', hideSalary: false, publishedAt: new Date('2026-08-20'), skills: [],
    company: {
      name: 'Northstar Labs', brandInitials: 'NL', brandColor: '#2658d8',
      verificationStatus: 'VERIFIED',
    },
  },
  resume: {
    id: 'resume-1', originalFileName: 'resume.pdf', mimeType: 'application/pdf',
    fileSize: 2_048, parseStatus: 'READY', createdAt: new Date('2026-08-01'),
  },
  screeningAnswers: [],
  statusHistory: [{
    id: 'history-1', previousStatus: 'APPLIED', newStatus: 'UNDER_REVIEW',
    reason: 'Recruiter started reviewing the application.',
    createdAt: new Date('2026-09-02T00:00:00.000Z'),
  }],
  recruiterNotes: [{ body: 'Must remain private' }],
};

describe('applicant application presenter', () => {
  it('maps canonical statuses to the current frontend vocabulary', () => {
    expect(toApplicantApplication(application)).toMatchObject({
      id: 'application-1',
      statusCode: 'UNDER_REVIEW',
      status: 'Screening',
      job: { id: 'job-1', statusCode: 'CLOSED', status: 'Closed' },
      resume: { id: 'resume-1', name: 'resume.pdf' },
      timeline: [{ status: 'Screening' }],
    });
  });

  it('never exposes private recruiter notes even if an unsafe record includes them', () => {
    expect(toApplicantApplication(application)).not.toHaveProperty('recruiterNotes');
  });
});
