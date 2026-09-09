import { describe, expect, it } from 'vitest';
import {
  jobIdentifierParamsSchema,
  publicJobListQuerySchema,
} from '../src/modules/jobs/job.schemas.js';

describe('public job request schemas', () => {
  it('normalizes repeated facets and pagination from URL query values', () => {
    const result = publicJobListQuerySchema.parse({
      q: ' React ',
      types: ['Full-time', 'Internship'],
      modes: 'Hybrid',
      skills: ['JavaScript', 'React'],
      datePosted: '7',
      sort: 'newest',
      page: '2',
      pageSize: '6',
    });

    expect(result).toMatchObject({
      q: 'React',
      types: ['Full-time', 'Internship'],
      modes: ['Hybrid'],
      skills: ['JavaScript', 'React'],
      datePosted: '7',
      sort: 'newest',
      page: 2,
      pageSize: 6,
    });
    expect(result.companyTypes).toEqual([]);
  });

  it('rejects unsupported sorting, date windows, and oversized pages', () => {
    expect(publicJobListQuerySchema.safeParse({ sort: 'random' }).success).toBe(false);
    expect(publicJobListQuerySchema.safeParse({ datePosted: '365' }).success).toBe(false);
    expect(publicJobListQuerySchema.safeParse({ pageSize: 51 }).success).toBe(false);
  });

  it('validates public job identifiers', () => {
    expect(jobIdentifierParamsSchema.parse({ jobId: 'frontend-engineer' })).toEqual({
      jobId: 'frontend-engineer',
    });
    expect(jobIdentifierParamsSchema.safeParse({ jobId: '' }).success).toBe(false);
  });
});
