import { describe, expect, it } from 'vitest';
import {
  MATCHING_WEIGHTS,
  MATCH_LABELS,
  SKILL_WEIGHTS,
} from '../src/modules/matching/matching.constants.js';

describe('matching configuration', () => {
  it('keeps hybrid component weights explicit and normalized', () => {
    expect(Object.values(MATCHING_WEIGHTS).reduce((total, weight) => total + weight, 0)).toBe(100);
  });

  it('weights required skills more heavily than preferred skills', () => {
    expect(SKILL_WEIGHTS.required).toBeGreaterThan(SKILL_WEIGHTS.preferred);
    expect(SKILL_WEIGHTS.required + SKILL_WEIGHTS.preferred).toBe(100);
  });

  it('defines a complete descending label scale', () => {
    expect(MATCH_LABELS.map(({ minimum }) => minimum)).toEqual([80, 60, 40, 0]);
  });
});
