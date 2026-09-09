import { describe, expect, it } from 'vitest';
import { createJobSlug } from '../src/modules/jobs/jobSlug.service.js';

describe('job slug service', () => {
  it('combines a readable title with an opaque uniqueness suffix', () => {
    expect(createJobSlug('Graduate Frontend Engineer', {
      suffixFactory: () => 'AbCdEf1234567890',
    })).toBe('graduate-frontend-engineer-abcdef1234');
  });

  it('uses a stable fallback for an empty or symbolic title', () => {
    expect(createJobSlug('+++', { suffixFactory: () => '1234567890abcdef' }))
      .toBe('job-1234567890');
  });
});
