import { describe, expect, it } from 'vitest';
import { calculateStructuredMatch } from '../src/modules/matching/structuredMatch.service.js';

const now = new Date('2026-09-10T00:00:00.000Z');
const job = {
  workMode: 'REMOTE',
  location: 'India',
  experienceMin: 2,
  skills: [
    { requirement: 'REQUIRED', skill: { name: 'JavaScript', normalizedName: 'javascript' } },
    { requirement: 'REQUIRED', skill: { name: 'PostgreSQL', normalizedName: 'postgresql' } },
    { requirement: 'PREFERRED', skill: { name: 'Docker', normalizedName: 'docker' } },
  ],
};

function profile(skills = []) {
  return {
    skills: skills.map((name) => ({ skill: { name, normalizedName: name.toLowerCase() } })),
    experiences: [{
      startDate: new Date('2023-09-10T00:00:00.000Z'),
      endDate: null,
      isCurrent: true,
    }],
    applicantEducations: [{ qualification: 'B.Tech' }],
    preferredWorkModes: ['Remote'],
    preferredLocations: ['Remote'],
  };
}

describe('structured match service', () => {
  it('scores transparent job-relevant profile evidence', () => {
    expect(calculateStructuredMatch(job, profile(['JavaScript', 'Docker']), now)).toMatchObject({
      skillScore: 60,
      requiredSkillScore: 50,
      preferredSkillScore: 100,
      experienceScore: 100,
      educationScore: 100,
      preferenceScore: 100,
      requiredSkillsMatched: ['JavaScript'],
      requiredSkillsMissing: ['PostgreSQL'],
      preferredSkillsMatched: ['Docker'],
    });
  });

  it('makes missing required skills cost more than missing preferred skills', () => {
    const missingRequired = calculateStructuredMatch(job, profile(['JavaScript', 'Docker']), now);
    const missingPreferred = calculateStructuredMatch(
      job,
      profile(['JavaScript', 'PostgreSQL']),
      now,
    );
    expect(missingRequired.skillScore).toBeLessThan(missingPreferred.skillScore);
  });

  it('bounds incomplete experience and missing education evidence', () => {
    const result = calculateStructuredMatch({ ...job, experienceMin: 10 }, {
      ...profile(['JavaScript']),
      experiences: [{ startDate: new Date('2026-03-10'), endDate: now, isCurrent: false }],
      applicantEducations: [],
      preferredLocations: [],
      preferredWorkModes: [],
    }, now);
    expect(result.experienceScore).toBeGreaterThan(0);
    expect(result.experienceScore).toBeLessThan(10);
    expect(result.educationScore).toBe(0);
    expect(result.preferenceScore).toBe(50);
  });

  it('does not use personal demographic fields as matching signals', () => {
    const baseline = calculateStructuredMatch(job, profile(['JavaScript']), now);
    const withDemographics = calculateStructuredMatch(job, {
      ...profile(['JavaScript']),
      name: 'Different Name',
      age: 55,
      gender: 'not-a-signal',
      photograph: 'not-a-signal',
    }, now);
    expect(withDemographics).toEqual(baseline);
  });
});
