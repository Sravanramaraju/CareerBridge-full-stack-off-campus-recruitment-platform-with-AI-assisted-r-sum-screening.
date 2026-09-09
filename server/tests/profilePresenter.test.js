import { describe, expect, it } from 'vitest';
import {
  toApplicantProfile,
  toApplicantSkillRecords,
} from '../src/modules/profiles/profile.presenter.js';

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
      { skill: { id: 'skill-css', name: 'CSS', normalizedName: 'css' }, proficiency: 'ADVANCED', yearsExperience: 2 },
      { skill: { id: 'skill-javascript', name: 'JavaScript', normalizedName: 'javascript' }, proficiency: 'ADVANCED', yearsExperience: 2.5 },
      { skill: { id: 'skill-react', name: 'React', normalizedName: 'react' }, proficiency: null, yearsExperience: null },
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
  it('flattens normalized skill relations for API consumers', () => {
    const [record] = toApplicantSkillRecords([
      {
        skill: { id: 'skill-react', name: 'React', normalizedName: 'react' },
        proficiency: 'ADVANCED',
        yearsExperience: { toString: () => '2.5' },
      },
    ]);

    expect(record).toEqual({
      id: 'skill-react',
      name: 'React',
      normalizedName: 'react',
      proficiency: 'ADVANCED',
      yearsExperience: 2.5,
    });
  });

  it('adapts normalized evidence to the current frontend profile shape', () => {
    const result = toApplicantProfile(profileRecord());

    expect(result).toMatchObject({
      id: 'profile-1',
      name: 'Ananya Rao',
      email: 'ananya@example.com',
      skills: ['CSS', 'JavaScript', 'React'],
      skillRecords: [
        expect.objectContaining({ id: 'skill-css', name: 'CSS', yearsExperience: 2 }),
        expect.objectContaining({ id: 'skill-javascript', name: 'JavaScript', yearsExperience: 2.5 }),
        expect.objectContaining({ id: 'skill-react', name: 'React', yearsExperience: null }),
      ],
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
