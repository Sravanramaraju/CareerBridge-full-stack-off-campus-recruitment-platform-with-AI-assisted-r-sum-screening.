import { describe, expect, it, vi } from 'vitest';
import {
  getPublicCompanies,
  getPublicCompany,
  getRecruiterCompany,
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

  it('returns only the company derived from recruiter membership', async () => {
    const findMembership = vi.fn().mockResolvedValue({
      role: 'OWNER',
      company: {
        id: 'company-1',
        name: 'Northstar Labs',
        description: 'Developer infrastructure.',
        brandInitials: 'NL',
        brandColor: '#2658d8',
        verificationStatus: 'VERIFIED',
      },
    });

    const result = await getRecruiterCompany('recruiter-1', { findMembership });

    expect(findMembership).toHaveBeenCalledWith('recruiter-1');
    expect(result).toMatchObject({ id: 'company-1', membershipRole: 'OWNER' });
  });

  it('forbids recruiter company access without a membership', async () => {
    await expect(
      getRecruiterCompany('recruiter-1', {
        findMembership: vi.fn().mockResolvedValue(null),
      }),
    ).rejects.toMatchObject({ code: 'COMPANY_MEMBERSHIP_REQUIRED', status: 403 });
  });
});
