import { describe, expect, it, vi } from 'vitest';
import { getAdminCompanies } from '../src/modules/admin/adminCompany.service.js';

describe('admin company service', () => {
  it('presents and paginates the company moderation queue', async () => {
    const filters = { status: 'PENDING', page: 2, pageSize: 10 };
    const company = {
      id: 'company-1', name: 'Northstar', slug: 'northstar', website: null,
      industry: null, companyType: null, size: null, headquarters: null,
      verificationStatus: 'PENDING', verifiedAt: null,
      _count: { members: 1, jobs: 2 }, createdAt: new Date(), updatedAt: new Date(),
    };
    const listCompanies = vi.fn().mockResolvedValue({ companies: [company], total: 12 });
    const result = await getAdminCompanies(filters, { listCompanies });
    expect(listCompanies).toHaveBeenCalledWith(filters);
    expect(result).toMatchObject({
      items: [{ id: 'company-1', verificationLabel: 'Pending' }],
      pagination: { page: 2, pageSize: 10, total: 12, totalPages: 2 },
    });
  });
});
