import { describe, expect, it } from 'vitest';
import { toApplicantProfile } from '../src/modules/profiles/profile.presenter.js';

function profileRecord() {
  return {
    id: 'profile-1',
    user: { name: 'Ananya Rao', email: 'ananya@example.com' },
    headline: 'Frontend developer',
    phone: null,
    location: 'Bengaluru, Karnataka',
    summary: 'Builds accessible interfaces.',
    preferredLocations: ['Bengaluru'],
    preferredJobTypes: ['Full-time'],
    preferredWorkModes: ['Hybrid'],
    skills: [
      { skill: { name: 'CSS' } },
      { skill: { name: 'JavaScript' } },
      { skill: { name: 'React' } },
    ],
    applicantEducations: [
      { id: 'education-1', qualification: 'B.E.', startYear: 2022, endYear: 2026, isCurrent: false },
    ],
    experiences: [],
    projects: [{ id: 'project-1', name: 'CareerBridge' }],
    certifications: [{ id: 'cert-1', name: 'Responsive Web Design', issuer: 'freeCodeCamp' }],
    resumes: [
      { id: 'resume-2', originalFileName: 'older.pdf', isPrimary: false },
      { id: 'resume-1', originalFileName: 'Ananya_Resume.pdf', isPrimary: true },
    ],
    createdAt: new Date('2026-09-01T00:00:00.000Z'),
    updatedAt: new Date('2026-09-09T00:00:00.000Z'),
  };
}

describe('applicant profile presenter', () => {
  it('adapts normalized evidence to the current frontend profile shape', () => {
    const result = toApplicantProfile(profileRecord());

    expect(result).toMatchObject({
      id: 'profile-1',
      name: 'Ananya Rao',
      email: 'ananya@example.com',
      skills: ['CSS', 'JavaScript', 'React'],
      education: [{ id: 'education-1', period: '2022–2026' }],
      certifications: ['Responsive Web Design · freeCodeCamp'],
      preferences: {
        locations: ['Bengaluru'],
        jobTypes: ['Full-time'],
        workModes: ['Hybrid'],
      },
      resumeName: 'Ananya_Resume.pdf',
    });
  });

  it('includes server-computed completion and missing sections', () => {
    const result = toApplicantProfile(profileRecord());

    expect(result.profileCompletion).toBe(90);
    expect(result.missingSections).toEqual(['experience']);
  });
});
