import { describe, expect, it, vi } from 'vitest';
import {
  findPublicCompanyByIdentifier,
  listPublicCompanies,
} from '../src/modules/companies/company.repository.js';

describe('company repository', () => {
  it('lists only verified companies with server-side filters and pagination', async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    const count = vi.fn().mockResolvedValue(0);
    const now = new Date('2026-09-09T00:00:00.000Z');
    const filters = {
      q: 'labs',
      industry: 'Developer tools',
      size: '201–500 employees',
      location: 'Bengaluru',
      companyType: 'Product',
      page: 2,
      pageSize: 12,
    };

    await listPublicCompanies(filters, now, { company: { findMany, count } });

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          verificationStatus: 'VERIFIED',
          industry: 'Developer tools',
          size: '201–500 employees',
          companyType: 'Product',
        }),
        skip: 12,
        take: 12,
      }),
    );
    expect(count).toHaveBeenCalledWith({ where: findMany.mock.calls[0][0].where });
  });

  it('counts only active, cleared public jobs for each company', async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    const now = new Date('2026-09-09T00:00:00.000Z');

    await listPublicCompanies(
      { page: 1, pageSize: 12 },
      now,
      { company: { findMany, count: vi.fn().mockResolvedValue(0) } },
    );

    expect(findMany.mock.calls[0][0].select._count.select.jobs.where).toEqual({
      status: 'PUBLISHED',
      moderationStatus: 'CLEARED',
      deadline: { gt: now },
    });
  });

  it('finds a verified company by either database id or public slug', async () => {
    const findFirst = vi.fn().mockResolvedValue(null);
    const now = new Date('2026-09-09T00:00:00.000Z');

    await findPublicCompanyByIdentifier('northstar-labs', now, { company: { findFirst } });

    expect(findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          verificationStatus: 'VERIFIED',
          OR: [{ id: 'northstar-labs' }, { slug: 'northstar-labs' }],
        },
      }),
    );
  });
});
