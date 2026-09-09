import { describe, expect, it, vi } from 'vitest';
import {
  getPublicCompanies,
  getPublicCompany,
} from '../src/modules/companies/company.service.js';

describe('company service', () => {
  it('presents company records with deterministic pagination metadata', async () => {
    const now = new Date('2026-09-09T00:00:00.000Z');
    const filters = { page: 2, pageSize: 12 };
    const listCompanies = vi.fn().mockResolvedValue({
      companies: [
        {
          id: 'company-1',
          name: 'Northstar Labs',
          headquarters: 'Bengaluru, Karnataka',
          locations: [],
          foundedYear: 2018,
          brandInitials: 'NL',
          brandColor: '#2658d8',
          verificationStatus: 'VERIFIED',
          _count: { jobs: 4 },
        },
      ],
      total: 25,
    });

    const result = await getPublicCompanies(filters, {
      listCompanies,
      now: () => now,
    });

    expect(listCompanies).toHaveBeenCalledWith(filters, now);
    expect(result.items[0]).toMatchObject({ id: 'company-1', openRoles: 4 });
    expect(result.pagination).toEqual({ page: 2, pageSize: 12, total: 25, totalPages: 3 });
  });

  it('returns a presented verified company detail', async () => {
    const company = {
      id: 'company-1',
      name: 'Northstar Labs',
      headquarters: 'Bengaluru, Karnataka',
      locations: [],
      foundedYear: 2018,
      brandInitials: 'NL',
      brandColor: '#2658d8',
      verificationStatus: 'VERIFIED',
      _count: { jobs: 4 },
    };

    const result = await getPublicCompany('northstar-labs', {
      findCompany: vi.fn().mockResolvedValue(company),
    });

    expect(result).toMatchObject({ id: 'company-1', openRoles: 4, verified: true });
  });

  it('returns a stable not-found error for unavailable company profiles', async () => {
    await expect(
      getPublicCompany('missing-company', {
        findCompany: vi.fn().mockResolvedValue(null),
      }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND', status: 404 });
  });
});
