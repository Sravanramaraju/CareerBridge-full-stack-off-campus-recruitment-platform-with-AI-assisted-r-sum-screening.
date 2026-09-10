import { describe, expect, it, vi } from 'vitest';
import { createGetRecommendationsHandler } from '../src/modules/matching/recommendation.controller.js';

describe('recommendation controller', () => {
  it('forwards authenticated identity and validated query options', async () => {
    const result = { items: [], meta: { limit: 8 } };
    const getRecommendations = vi.fn().mockResolvedValue(result);
    const response = { json: vi.fn((value) => value) };
    await createGetRecommendationsHandler({ getRecommendations })({
      auth: { user: { id: 'applicant-1' } },
      validated: { query: { limit: 8 } },
    }, response, vi.fn());
    expect(getRecommendations).toHaveBeenCalledWith('applicant-1', { limit: 8 });
    expect(response.json).toHaveBeenCalledWith({ data: result });
  });
});
