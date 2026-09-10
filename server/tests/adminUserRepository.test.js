import { describe, expect, it, vi } from 'vitest';
import {
  findAdminUser,
  listAdminUsers,
  revokeUserSessions,
  updateUserStatus,
} from '../src/modules/admin/adminUser.repository.js';

describe('admin user repository', () => {
  it('searches and paginates users by role and status', async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    const count = vi.fn().mockResolvedValue(0);
    await listAdminUsers({
      q: 'ananya', role: 'APPLICANT', status: 'ACTIVE', page: 2, pageSize: 10,
    }, { user: { findMany, count } });
    const query = findMany.mock.calls[0][0];
    expect(query.where).toMatchObject({ role: 'APPLICANT', status: 'ACTIVE' });
    expect(query.where.OR).toHaveLength(2);
    expect(query).toMatchObject({ skip: 10, take: 10 });
    expect(count).toHaveBeenCalledWith({ where: query.where });
  });

  it('loads one user with current session and activity counts', async () => {
    const findUnique = vi.fn().mockResolvedValue(null);
    await findAdminUser('user-1', { user: { findUnique } });
    const query = findUnique.mock.calls[0][0];
    expect(query.where).toEqual({ id: 'user-1' });
    expect(query.select._count.select).toHaveProperty('sessions');
  });

  it('guards user status writes by the current state', async () => {
    const updateMany = vi.fn().mockResolvedValue({ count: 1 });
    await updateUserStatus('user-1', 'ACTIVE', 'SUSPENDED', { user: { updateMany } });
    expect(updateMany).toHaveBeenCalledWith({
      where: { id: 'user-1', status: 'ACTIVE' }, data: { status: 'SUSPENDED' },
    });
  });

  it('revokes every active session owned by a suspended user', async () => {
    const deleteMany = vi.fn().mockResolvedValue({ count: 2 });
    await revokeUserSessions('user-1', { session: { deleteMany } });
    expect(deleteMany).toHaveBeenCalledWith({ where: { userId: 'user-1' } });
  });
});
