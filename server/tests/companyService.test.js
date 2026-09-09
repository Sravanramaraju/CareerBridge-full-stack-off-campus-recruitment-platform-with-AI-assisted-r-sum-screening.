import { describe, expect, it, vi } from 'vitest';
import {
  getPublicCompanies,
  getPublicCompany,
  getRecruiterCompany,
  updateRecruiterCompany,
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

  it('updates the company id derived from membership in one transaction', async () => {
    const database = { marker: 'transaction-client' };
    const updateCompany = vi.fn().mockResolvedValue({
      id: 'company-1',
      name: 'Northstar Labs',
      description: 'Updated profile.',
      brandInitials: 'NL',
      brandColor: '#2658d8',
      verificationStatus: 'VERIFIED',
    });

    const result = await updateRecruiterCompany(
      'recruiter-1',
      { name: 'Northstar Labs', about: 'Updated profile.' },
      {
        runTransaction: (operation) => operation(database),
        findMembership: vi.fn().mockResolvedValue({
          role: 'OWNER',
          company: { id: 'company-1' },
        }),
        updateCompany,
      },
    );

    expect(updateCompany).toHaveBeenCalledWith(
      'company-1',
      { name: 'Northstar Labs', description: 'Updated profile.' },
      database,
    );
    expect(result).toMatchObject({ id: 'company-1', about: 'Updated profile.' });
  });

  it('does not update a company when membership is absent', async () => {
    const updateCompany = vi.fn();

    await expect(
      updateRecruiterCompany('recruiter-1', { name: 'Unauthorized edit' }, {
        runTransaction: (operation) => operation({}),
        findMembership: vi.fn().mockResolvedValue(null),
        updateCompany,
      }),
    ).rejects.toMatchObject({ code: 'COMPANY_MEMBERSHIP_REQUIRED' });

    expect(updateCompany).not.toHaveBeenCalled();
  });
});
