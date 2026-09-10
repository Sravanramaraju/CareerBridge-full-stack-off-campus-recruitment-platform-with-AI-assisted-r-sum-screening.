import { describe, expect, it, vi } from 'vitest';
import { createApplicationMatch } from '../src/modules/matching/applicationMatch.repository.js';

describe('application match repository', () => {
  it('persists an immutable explainable match snapshot for an application', async () => {
    const create = vi.fn().mockResolvedValue({ id: 'match-1' });
    const match = {
      overallScore: 82,
      requiredSkillScore: 75,
      preferredSkillScore: 100,
      experienceScore: 100,
      preferenceScore: 50,
      semanticScore: null,
      semanticAvailable: false,
      requiredSkillsMatched: ['JavaScript'],
      requiredSkillsMissing: ['PostgreSQL'],
      preferredSkillsMatched: ['Docker'],
      explanation: { label: 'Strong match', reasons: ['One required skill is missing.'] },
      modelVersion: 'careerbridge-hybrid-v1',
    };

    await createApplicationMatch('application-1', match, { applicationMatch: { create } });
    expect(create).toHaveBeenCalledWith({
      data: { applicationId: 'application-1', ...match },
    });
  });
});
