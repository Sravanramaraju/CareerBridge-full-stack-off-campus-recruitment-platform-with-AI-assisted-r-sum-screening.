import { describe, expect, it } from 'vitest';
import { buildPublicJobQuery } from '../src/modules/jobs/jobQuery.js';

describe('public job query mapping', () => {
  it('enforces lifecycle, moderation, expiry, and verified-company visibility', () => {
    const now = new Date('2026-09-09T00:00:00.000Z');
    const result = buildPublicJobQuery({ sort: 'recommended' }, now);

    expect(result.where).toMatchObject({
      status: 'PUBLISHED',
      moderationStatus: 'CLEARED',
      deadline: { gt: now },
      company: { is: { verificationStatus: 'VERIFIED' } },
    });
    expect(result.orderBy).toEqual([
      { featured: 'desc' },
      { publishedAt: 'desc' },
      { id: 'asc' },
    ]);
  });

  it('maps frontend labels into database enums and exact experience ranges', () => {
    const result = buildPublicJobQuery({
      sort: 'newest',
      types: ['Full-time', 'Internship'],
      modes: ['On-site', 'Hybrid'],
      experience: '0–1 years',
      experiences: ['1–2 years'],
    });

    expect(result.where.AND).toEqual(
      expect.arrayContaining([
        { employmentType: { in: ['FULL_TIME', 'INTERNSHIP'] } },
        { workMode: { in: ['ON_SITE', 'HYBRID'] } },
        { OR: [{ experienceMin: 1, experienceMax: 2 }, { experienceMin: 0, experienceMax: 1 }] },
      ]),
    );
  });

  it('scopes company jobs by id or slug without weakening verification', () => {
    const result = buildPublicJobQuery({ sort: 'newest' }, new Date(), 'northstar-labs');

    expect(result.where.company).toEqual({
      is: {
        verificationStatus: 'VERIFIED',
        OR: [{ id: 'northstar-labs' }, { slug: 'northstar-labs' }],
      },
    });
  });

  it('translates a date-posted window relative to the request time', () => {
    const now = new Date('2026-09-09T12:00:00.000Z');
    const result = buildPublicJobQuery({ sort: 'newest', datePosted: '7' }, now);

    expect(result.where.AND).toContainEqual({
      publishedAt: { gte: new Date('2026-09-02T12:00:00.000Z') },
    });
  });
});
