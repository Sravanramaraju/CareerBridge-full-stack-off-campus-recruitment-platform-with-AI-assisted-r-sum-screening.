import { describe, expect, it } from 'vitest';
import {
  companyIdentifierParamsSchema,
  companyListQuerySchema,
  recruiterCompanyUpdateSchema,
} from '../src/modules/companies/company.schemas.js';

describe('company request schemas', () => {
  it('normalizes list pagination and preserves frontend filters', () => {
    expect(
      companyListQuerySchema.parse({
        q: '  Labs ',
        industry: 'Developer tools',
        size: '201–500 employees',
        location: 'Bengaluru',
        companyType: 'Product',
        page: '2',
        pageSize: '24',
      }),
    ).toEqual({
      q: 'Labs',
      industry: 'Developer tools',
      size: '201–500 employees',
      location: 'Bengaluru',
      companyType: 'Product',
      page: 2,
      pageSize: 24,
    });
  });

  it('applies safe pagination defaults', () => {
    expect(companyListQuerySchema.parse({})).toMatchObject({ page: 1, pageSize: 12 });
  });

  it('rejects excessive page sizes and blank identifiers', () => {
    expect(companyListQuerySchema.safeParse({ pageSize: 51 }).success).toBe(false);
    expect(companyIdentifierParamsSchema.safeParse({ companyId: ' ' }).success).toBe(false);
  });

  it('validates current recruiter company form fields', () => {
    expect(
      recruiterCompanyUpdateSchema.parse({
        name: ' Northstar Labs ',
        website: 'https://northstar.example',
        about: 'Developer infrastructure for product teams.',
        benefits: ['Learning budget', 'Flexible work'],
        locations: ['Bengaluru', 'Remote within India'],
      }),
    ).toMatchObject({
      name: 'Northstar Labs',
      website: 'https://northstar.example',
      benefits: ['Learning budget', 'Flexible work'],
    });
  });

  it('rejects empty patches and recruiter attempts to change verification', () => {
    expect(recruiterCompanyUpdateSchema.safeParse({}).success).toBe(false);
    expect(
      recruiterCompanyUpdateSchema.safeParse({ verificationStatus: 'VERIFIED' }).success,
    ).toBe(false);
  });
});
