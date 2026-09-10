import { describe, expect, it } from 'vitest';
import { recommendationQuerySchema } from '../src/modules/matching/recommendation.schemas.js';

describe('recommendation query schema', () => {
  it('defaults to a practical recommendation limit', () => {
    expect(recommendationQuerySchema.parse({})).toEqual({ limit: 12 });
  });

  it('coerces bounded query-string limits', () => {
    expect(recommendationQuerySchema.parse({ limit: '20' })).toEqual({ limit: 20 });
    expect(() => recommendationQuerySchema.parse({ limit: '21' })).toThrow();
  });
});
