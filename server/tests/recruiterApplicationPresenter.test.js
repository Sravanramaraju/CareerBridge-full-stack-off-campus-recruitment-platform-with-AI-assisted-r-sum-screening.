import { describe, expect, it } from 'vitest';
import {
  calculateCandidateExperienceMonths,
  toRecruiterCandidate,
} from '../src/modules/applications/recruiterApplication.presenter.js';

const now = new Date('2026-09-10T00:00:00.000Z');

describe('recruiter application presenter', () => {
  it('calculates total recorded experience without extra database queries', () => {
    expect(calculateCandidateExperienceMonths([
      { startDate: new Date('2024-09-10'), endDate: new Date('2025-09-10'), isCurrent: false },
      { startDate: new Date('2025-09-10'), endDate: null, isCurrent: true },
    ], now)).toBe(24);
  });

  it('maps candidate profile, match, and canonical status for the pipeline', () => {
    const result = toRecruiterCandidate({
      id: 'application-1', jobId: 'job-1', resumeId: 'resume-1', status: 'SHORTLISTED',
      appliedAt: new Date('2026-09-01'), updatedAt: new Date('2026-09-02'),
      applicant: {
        id: 'applicant-1', name: 'Ananya Rao', email: 'ananya@example.com',
        applicantProfile: {
          headline: 'Frontend developer', location: 'Bengaluru',
          experiences: [{ startDate: new Date('2025-09-10'), endDate: null, isCurrent: true }],
          skills: [{ skill: { name: 'React' } }, { skill: { name: 'JavaScript' } }],
        },
      },
      match: { overallScore: 88, explanation: { label: 'Strong match' } },
    }, now);
    expect(result).toMatchObject({
      applicationId: 'application-1',
      name: 'Ananya Rao',
      experienceMonths: 12,
      experience: '1 year',
      skills: ['React', 'JavaScript'],
      match: 88,
      statusCode: 'SHORTLISTED',
      status: 'Shortlisted',
      allowedTransitions: ['UNDER_REVIEW', 'INTERVIEW', 'REJECTED'],
    });
  });

  it('keeps unavailable match signals explicit instead of inventing a percentage', () => {
    const result = toRecruiterCandidate({
      id: 'application-1', jobId: 'job-1', resumeId: 'resume-1', status: 'APPLIED',
      appliedAt: now, updatedAt: now,
      applicant: { id: 'applicant-1', name: 'A', email: 'a@example.com', applicantProfile: null },
      match: null,
    }, now);
    expect(result.match).toBeNull();
    expect(result.experience).toBe('Fresher');
  });
});
