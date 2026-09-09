import { describe, expect, it } from 'vitest';
import { calculateProfileCompletion } from '../src/modules/profiles/profileCompletion.js';

function completeProfile() {
  return {
    user: { name: 'Ananya Rao', email: 'ananya@example.com' },
    location: 'Bengaluru, Karnataka',
    headline: 'Frontend developer',
    summary: 'Builds accessible product interfaces.',
    skills: [{}, {}, {}],
    applicantEducations: [{}],
    projects: [{}],
    experiences: [{}],
    certifications: [{}],
    resumes: [{}],
    preferredLocations: ['Bengaluru'],
    preferredJobTypes: ['Full-time'],
    preferredWorkModes: ['Hybrid'],
  };
}

describe('applicant profile completion', () => {
  it('returns full completion only when every evidence section is present', () => {
    expect(calculateProfileCompletion(completeProfile())).toEqual({
      profileCompletion: 100,
      missingSections: [],
    });
  });

  it('deterministically reports weighted missing evidence', () => {
    const profile = completeProfile();
    profile.skills = [{}, {}];
    profile.experiences = [];
    profile.resumes = [];

    expect(calculateProfileCompletion(profile)).toEqual({
      profileCompletion: 65,
      missingSections: ['skills', 'experience', 'resume'],
    });
  });

  it('does not trust any completion value supplied with profile data', () => {
    const profile = { ...completeProfile(), profileCompletion: 1_000 };

    expect(calculateProfileCompletion(profile).profileCompletion).toBe(100);
  });
});
