import { describe, expect, it, vi } from 'vitest';
import { getAdminUsers, moderateUserStatus } from '../src/modules/admin/adminUser.service.js';

const database = { marker: 'transaction-client' };
const date = new Date('2026-09-10T00:00:00.000Z');

function user(status = 'ACTIVE') {
  return {
    id: 'user-1', email: 'user@example.com', name: 'User', role: 'APPLICANT', status,
    _count: { sessions: status === 'ACTIVE' ? 1 : 0, applications: 2, companyMemberships: 0 },
    lastLoginAt: date, createdAt: date, updatedAt: date,
  };
}

describe('admin user service', () => {
  it('presents and paginates the user moderation queue', async () => {
    const filters = { role: 'APPLICANT', page: 2, pageSize: 10 };
    const listUsers = vi.fn().mockResolvedValue({ users: [user()], total: 12 });
    await expect(getAdminUsers(filters, { listUsers })).resolves.toMatchObject({
      items: [{ id: 'user-1', roleLabel: 'Applicant', statusLabel: 'Active' }],
      pagination: { page: 2, pageSize: 10, total: 12, totalPages: 2 },
    });
    expect(listUsers).toHaveBeenCalledWith(filters);
  });

  it('suspends a user, revokes sessions, audits, and records a security notification', async () => {
    const findUser = vi.fn().mockResolvedValueOnce(user()).mockResolvedValueOnce(user('SUSPENDED'));
    const updateStatus = vi.fn().mockResolvedValue({ count: 1 });
    const revokeSessions = vi.fn().mockResolvedValue({ count: 1 });
    const writeAudit = vi.fn().mockResolvedValue({ id: 'audit-1' });
    const createNotifications = vi.fn().mockResolvedValue({ count: 1 });
    await expect(moderateUserStatus(
      'admin-1', 'user-1', { status: 'SUSPENDED', reason: 'Policy violation.' },
      { requestId: 'request-1' },
      {
        runTransaction: (operation) => operation(database),
        findUser,
        updateStatus,
        revokeSessions,
        writeAudit,
        createNotifications,
      },
    )).resolves.toMatchObject({ status: 'SUSPENDED', activeSessionCount: 0 });
    expect(updateStatus).toHaveBeenCalledWith('user-1', 'ACTIVE', 'SUSPENDED', database);
    expect(revokeSessions).toHaveBeenCalledWith('user-1', database);
    expect(writeAudit).toHaveBeenCalledWith(expect.objectContaining({
      action: 'USER_STATUS_CHANGED',
      metadata: { from: 'ACTIVE', to: 'SUSPENDED', reason: 'Policy violation.' },
    }), database);
    expect(createNotifications).toHaveBeenCalledWith([expect.objectContaining({
      userId: 'user-1', type: 'SECURITY',
    })], database);
  });

  it('does not revoke sessions when reactivating a user', async () => {
    const revokeSessions = vi.fn();
    await moderateUserStatus('admin-1', 'user-1', { status: 'ACTIVE' }, {}, {
      runTransaction: (operation) => operation(database),
      findUser: vi.fn().mockResolvedValueOnce(user('SUSPENDED')).mockResolvedValueOnce(user()),
      updateStatus: vi.fn().mockResolvedValue({ count: 1 }),
      revokeSessions,
      writeAudit: vi.fn(),
      createNotifications: vi.fn(),
    });
    expect(revokeSessions).not.toHaveBeenCalled();
  });

  it('prevents administrators from suspending their own account', async () => {
    await expect(moderateUserStatus(
      'admin-1', 'admin-1', { status: 'SUSPENDED', reason: 'Mistake.' },
    )).rejects.toMatchObject({ code: 'ADMIN_SELF_SUSPENSION', status: 409 });
  });

  it('keeps repeated status decisions idempotent', async () => {
    const updateStatus = vi.fn();
    await moderateUserStatus('admin-1', 'user-1', { status: 'SUSPENDED' }, {}, {
      runTransaction: (operation) => operation(database),
      findUser: vi.fn().mockResolvedValue(user('SUSPENDED')),
      updateStatus,
    });
    expect(updateStatus).not.toHaveBeenCalled();
  });
});
