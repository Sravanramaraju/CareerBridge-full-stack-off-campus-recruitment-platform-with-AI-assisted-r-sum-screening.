import { describe, expect, it, vi } from 'vitest';
import {
  findPublicJobByIdentifier,
  listPublicJobs,
} from '../src/modules/jobs/job.repository.js';

describe('public job repository', () => {
  it('applies translated filters, stable pagination, and related display data', async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    const count = vi.fn().mockResolvedValue(0);
    const filters = {
      sort: 'newest',
      page: 2,
      pageSize: 6,
      types: [],
      modes: [],
      salaryBands: [],
      industries: [],
      skills: [],
      experiences: [],
      locations: [],
      companyTypes: [],
    };
    const now = new Date('2026-09-09T00:00:00.000Z');

    await listPublicJobs(filters, now, { job: { findMany, count } });

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'PUBLISHED', moderationStatus: 'CLEARED' }),
        orderBy: [{ publishedAt: 'desc' }, { id: 'asc' }],
        skip: 6,
        take: 6,
        select: expect.objectContaining({ company: expect.any(Object), skills: expect.any(Object) }),
      }),
    );
    expect(count).toHaveBeenCalledWith({ where: findMany.mock.calls[0][0].where });
    expect(findMany.mock.calls[0][0].select.skills.select.skill.select).toEqual({
      id: true,
      name: true,
      normalizedName: true,
    });
  });

  it('passes company ownership scope into the public query builder', async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    const filters = { sort: 'newest', page: 1, pageSize: 12 };

    await listPublicJobs(
      filters,
      new Date(),
      { job: { findMany, count: vi.fn().mockResolvedValue(0) } },
      'northstar-labs',
    );

    expect(findMany.mock.calls[0][0].where.company.is.OR).toEqual([
      { id: 'northstar-labs' },
      { slug: 'northstar-labs' },
    ]);
  });

  it('finds job details by id or slug without bypassing public visibility', async () => {
    const findFirst = vi.fn().mockResolvedValue(null);
    const now = new Date('2026-09-09T00:00:00.000Z');

    await findPublicJobByIdentifier('frontend-engineer', now, { job: { findFirst } });

    expect(findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          status: 'PUBLISHED',
          moderationStatus: 'CLEARED',
          deadline: { gt: now },
          company: { is: { verificationStatus: 'VERIFIED' } },
          OR: [{ id: 'frontend-engineer' }, { slug: 'frontend-engineer' }],
        },
      }),
    );
  });
});
