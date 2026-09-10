import { describe, expect, it, vi } from 'vitest';
import {
  findAdminCompany,
  listAdminCompanies,
  updateCompanyVerificationStatus,
} from '../src/modules/admin/adminCompany.repository.js';

describe('admin company repository', () => {
  it('searches and paginates the company moderation queue', async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    const count = vi.fn().mockResolvedValue(0);
    await listAdminCompanies({ q: 'north', status: 'PENDING', page: 2, pageSize: 10 }, {
      company: { findMany, count },
    });
    const expectedWhere = {
      verificationStatus: 'PENDING',
      OR: [
        { name: { contains: 'north', mode: 'insensitive' } },
        { industry: { contains: 'north', mode: 'insensitive' } },
        { headquarters: { contains: 'north', mode: 'insensitive' } },
      ],
    };
    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expectedWhere, skip: 10, take: 10,
    }));
    expect(count).toHaveBeenCalledWith({ where: expectedWhere });
  });

  it('loads one company regardless of its current verification status', async () => {
    const findUnique = vi.fn().mockResolvedValue(null);
    await findAdminCompany('company-1', { company: { findUnique } });
    expect(findUnique).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'company-1' } }));
  });

  it('guards verification writes by the previously reviewed status', async () => {
    const updateMany = vi.fn().mockResolvedValue({ count: 1 });
    const verifiedAt = new Date('2026-09-10T00:00:00.000Z');
    await updateCompanyVerificationStatus(
      'company-1', 'PENDING', 'VERIFIED', verifiedAt, { company: { updateMany } },
    );
    expect(updateMany).toHaveBeenCalledWith({
      where: { id: 'company-1', verificationStatus: 'PENDING' },
      data: { verificationStatus: 'VERIFIED', verifiedAt },
    });
  });
});
