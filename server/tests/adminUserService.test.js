import { describe, expect, it, vi } from 'vitest';
import { getAdminUsers } from '../src/modules/admin/adminUser.service.js';

describe('admin user service', () => {
  it('presents and paginates the user moderation queue', async () => {
    const filters = { role: 'APPLICANT', page: 2, pageSize: 10 };
    const date = new Date('2026-09-10T00:00:00.000Z');
    const user = {
      id: 'user-1', email: 'user@example.com', name: 'User', role: 'APPLICANT',
      status: 'ACTIVE', _count: { sessions: 1, applications: 2, companyMemberships: 0 },
      lastLoginAt: date, createdAt: date, updatedAt: date,
    };
    const listUsers = vi.fn().mockResolvedValue({ users: [user], total: 12 });
    await expect(getAdminUsers(filters, { listUsers })).resolves.toMatchObject({
      items: [{ id: 'user-1', roleLabel: 'Applicant', statusLabel: 'Active' }],
      pagination: { page: 2, pageSize: 10, total: 12, totalPages: 2 },
    });
    expect(listUsers).toHaveBeenCalledWith(filters);
  });
});
