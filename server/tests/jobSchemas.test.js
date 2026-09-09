import { describe, expect, it } from 'vitest';
import {
  jobIdentifierParamsSchema,
  publicJobListQuerySchema,
  recruiterJobCreateSchema,
  recruiterJobUpdateSchema,
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

  it('rejects facet values that have no backend domain mapping', () => {
    expect(publicJobListQuerySchema.safeParse({ types: 'Volunteer' }).success).toBe(false);
    expect(publicJobListQuerySchema.safeParse({ modes: 'Anywhere' }).success).toBe(false);
    expect(publicJobListQuerySchema.safeParse({ salaryBands: 'Negotiable' }).success).toBe(false);
    expect(publicJobListQuerySchema.safeParse({ companyTypes: 'Unknown' }).success).toBe(false);
    expect(publicJobListQuerySchema.safeParse({ experience: 'Senior' }).success).toBe(false);
  });

  it('validates public job identifiers', () => {
    expect(jobIdentifierParamsSchema.parse({ jobId: 'frontend-engineer' })).toEqual({
      jobId: 'frontend-engineer',
    });
    expect(jobIdentifierParamsSchema.safeParse({ jobId: '' }).success).toBe(false);
  });
});

describe('recruiter job request schemas', () => {
  it('supports a minimal persistent draft with safe defaults', () => {
    expect(recruiterJobCreateSchema.parse({})).toEqual({
      title: 'Untitled role',
      openings: 1,
      experienceMin: 0,
      experienceMax: 0,
      currency: 'INR',
      hideSalary: false,
      responsibilities: [],
      contactVisible: true,
      skills: [],
      screeningQuestions: [],
    });
  });

  it('normalizes complete draft skills, questions, and dates', () => {
    const result = recruiterJobCreateSchema.parse({
      title: 'Graduate Engineer',
      workMode: 'HYBRID',
      employmentType: 'FULL_TIME',
      deadline: '2026-10-01',
      skills: [{ name: ' React ', requirement: 'REQUIRED' }],
      screeningQuestions: [{ question: 'Can you work in Bengaluru?' }],
    });

    expect(result.deadline).toBeInstanceOf(Date);
    expect(result.skills).toEqual([{ name: 'React', requirement: 'REQUIRED' }]);
    expect(result.screeningQuestions[0]).toEqual({
      question: 'Can you work in Bengaluru?',
      required: false,
    });
  });

  it('rejects reversed ranges, duplicate skills, and empty updates', () => {
    expect(recruiterJobCreateSchema.safeParse({ experienceMin: 3, experienceMax: 1 }).success)
      .toBe(false);
    expect(recruiterJobCreateSchema.safeParse({
      skills: [{ name: 'React' }, { name: ' react ' }],
    }).success).toBe(false);
    expect(recruiterJobUpdateSchema.safeParse({}).success).toBe(false);
  });
});
