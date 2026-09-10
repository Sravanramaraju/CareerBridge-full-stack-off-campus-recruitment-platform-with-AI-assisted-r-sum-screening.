import { describe, expect, it } from 'vitest';
import { calculateHybridMatch } from '../src/modules/matching/hybridMatch.service.js';

const job = {
  workMode: 'REMOTE',
  location: 'India',
  experienceMin: 0,
  skills: [
    { requirement: 'REQUIRED', skill: { name: 'JavaScript', normalizedName: 'javascript' } },
  ],
};
const profile = {
  skills: [{ skill: { name: 'JavaScript', normalizedName: 'javascript' } }],
  experiences: [],
  applicantEducations: [{ qualification: 'B.Tech' }],
  preferredWorkModes: ['Remote'],
  preferredLocations: ['Remote'],
};

describe('hybrid match service', () => {
  it('combines all configured signals when semantic similarity is available', () => {
    expect(calculateHybridMatch(job, profile, { semanticScore: 50 })).toMatchObject({
      overallScore: 90,
      requiredSkillScore: 100,
      preferredSkillScore: 100,
      experienceScore: 100,
      preferenceScore: 100,
      semanticScore: 50,
      semanticAvailable: true,
      explanation: {
        label: 'Strong match',
        breakdown: {
          skills: 100,
          experience: 100,
          education: 100,
          location: 100,
          similarity: 50,
        },
      },
    });
  });

  it('renormalizes structured weights without fabricating semantic similarity', () => {
    const result = calculateHybridMatch(job, profile);
    expect(result.overallScore).toBe(100);
    expect(result.semanticScore).toBeNull();
    expect(result.semanticAvailable).toBe(false);
    expect(result.explanation.breakdown.similarity).toBeNull();
  });

  it('bounds semantic inputs and every overall score to zero through one hundred', () => {
    expect(calculateHybridMatch(job, profile, { semanticScore: 250 }).overallScore).toBe(100);
    expect(calculateHybridMatch({ ...job, experienceMin: 10 }, {
      ...profile,
      skills: [],
      applicantEducations: [],
      preferredWorkModes: ['On-site'],
      preferredLocations: ['Mumbai'],
    }, { semanticScore: -25 }).overallScore).toBeGreaterThanOrEqual(0);
  });
});
