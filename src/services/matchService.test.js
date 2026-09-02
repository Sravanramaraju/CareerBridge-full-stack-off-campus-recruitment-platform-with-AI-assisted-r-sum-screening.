import { describe, expect, it } from 'vitest';
import { jobs } from '@/src/data/mockData';
import { matchService } from '@/src/services/matchService';

const profile = {
  skills: ['react', 'JavaScript', 'CSS'],
  preferences: { workModes: ['Hybrid'], locations: ['Bengaluru'] },
};

describe('matchService', () => {
  it('returns an explainable deterministic score', () => {
    const first = matchService.scoreJob(jobs[0], profile);
    const second = matchService.scoreJob(jobs[0], profile);

    expect(first).toEqual(second);
    expect(first.matchedSkills).toEqual(['React', 'JavaScript', 'CSS']);
    expect(first.missingSkills).toEqual(['Git']);
    expect(first.location).toBe('Matched');
  });

  it('ignores protected or sensitive profile attributes', () => {
    const baseline = matchService.scoreJob(jobs[0], profile);
    const withSensitiveFields = matchService.scoreJob(jobs[0], { ...profile, age: 42, gender: 'undisclosed', religion: 'undisclosed' });

    expect(withSensitiveFields).toEqual(baseline);
  });
});
