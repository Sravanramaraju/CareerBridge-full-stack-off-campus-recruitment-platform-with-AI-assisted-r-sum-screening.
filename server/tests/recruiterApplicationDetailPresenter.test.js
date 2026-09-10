import { describe, expect, it } from 'vitest';
import { toRecruiterApplicationDetail } from '../src/modules/applications/recruiterApplicationDetail.presenter.js';

const now = new Date('2026-09-10T00:00:00.000Z');
const application = {
  id: 'application-1', jobId: 'job-1', resumeId: 'resume-1', coverNote: 'Hello',
  status: 'INTERVIEW', appliedAt: now, updatedAt: now,
  applicant: {
    id: 'applicant-1', name: 'Ananya Rao', email: 'ananya@example.com',
    passwordHash: 'must-not-leak',
    applicantProfile: {
      headline: 'Frontend developer', phone: '9999999999', location: 'Bengaluru',
      summary: 'Builds accessible applications.', preferredLocations: ['Bengaluru'],
      preferredJobTypes: ['Full-time'], preferredWorkModes: ['Hybrid'],
      applicantEducations: [{ id: 'education-1', qualification: 'B.Tech' }],
      experiences: [], projects: [{ id: 'project-1', name: 'Portal' }],
      certifications: [], skills: [{ skill: { name: 'React' } }],
    },
  },
  job: { id: 'job-1', title: 'Engineer', company: { id: 'company-1', name: 'Northstar' } },
  resume: {
    id: 'resume-1', originalFileName: 'ananya.pdf', mimeType: 'application/pdf',
    fileSize: 2_048, parseStatus: 'READY', createdAt: now, storageKey: 'must-not-leak',
  },
  screeningAnswers: [{ id: 'answer-1', questionSnapshot: 'Available?', answer: 'Yes' }],
  statusHistory: [{
    id: 'history-1', previousStatus: 'SHORTLISTED', newStatus: 'INTERVIEW',
    reason: 'Interview scheduled.', createdAt: now,
    changedBy: { id: 'recruiter-1', name: 'Rhea', role: 'RECRUITER' },
  }],
  match: {
    overallScore: 88, requiredSkillScore: 75, preferredSkillScore: 100,
    requiredSkillsMissing: ['PostgreSQL'],
  },
  recruiterNotes: [{
    id: 'note-1', body: 'Strong portfolio.', createdAt: now, updatedAt: now,
    author: { id: 'recruiter-1', name: 'Rhea' },
  }],
};

describe('recruiter application detail presenter', () => {
  it('assembles complete candidate evidence and private hiring context', () => {
    expect(toRecruiterApplicationDetail(application, now)).toMatchObject({
      applicationId: 'application-1',
      name: 'Ananya Rao',
      status: 'Interview',
      summary: 'Builds accessible applications.',
      education: [{ id: 'education-1' }],
      projects: [{ id: 'project-1' }],
      resume: { name: 'ananya.pdf', contentUrl: '/api/v1/resumes/resume-1/content' },
      history: [{ status: 'Interview', reason: 'Interview scheduled.' }],
      notes: [{ note: 'Strong portfolio.' }],
      requiredCoverage: '75%',
      preferredCoverage: '100%',
      missing: ['PostgreSQL'],
    });
  });

  it('does not expose account credentials or private storage keys', () => {
    const result = JSON.stringify(toRecruiterApplicationDetail(application, now));
    expect(result).not.toContain('passwordHash');
    expect(result).not.toContain('must-not-leak');
  });
});
