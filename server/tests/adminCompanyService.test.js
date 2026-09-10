import { describe, expect, it, vi } from 'vitest';
import {
  getAdminCompanies,
  moderateCompanyVerification,
} from '../src/modules/admin/adminCompany.service.js';

const database = { marker: 'transaction-client' };

function company(status = 'PENDING') {
  return {
    id: 'company-1', name: 'Northstar', slug: 'northstar', website: null,
    industry: null, companyType: null, size: null, headquarters: null,
    verificationStatus: status, verifiedAt: null,
    _count: { members: 1, jobs: 2 }, createdAt: new Date(), updatedAt: new Date(),
  };
}

describe('admin company service', () => {
  it('presents and paginates the company moderation queue', async () => {
    const filters = { status: 'PENDING', page: 2, pageSize: 10 };
    const listCompanies = vi.fn().mockResolvedValue({ companies: [company()], total: 12 });
    const result = await getAdminCompanies(filters, { listCompanies });
    expect(listCompanies).toHaveBeenCalledWith(filters);
    expect(result).toMatchObject({
      items: [{ id: 'company-1', verificationLabel: 'Pending' }],
      pagination: { page: 2, pageSize: 10, total: 12, totalPages: 2 },
    });
  });

  it('updates verification, audits it, and notifies recruiters atomically', async () => {
    const changedAt = new Date('2026-09-10T00:00:00.000Z');
    const findCompany = vi.fn()
      .mockResolvedValueOnce(company())
      .mockResolvedValueOnce({ ...company('VERIFIED'), verifiedAt: changedAt });
    const updateVerification = vi.fn().mockResolvedValue({ count: 1 });
    const writeAudit = vi.fn().mockResolvedValue({ id: 'audit-1' });
    const createNotifications = vi.fn().mockResolvedValue({ count: 1 });
    const queueMessage = vi.fn().mockResolvedValue({ id: 'email-1' });
    const recruiters = [{ user: {
      id: 'recruiter-1', name: 'Recruiter', email: 'recruiter@example.com',
    } }];

    await expect(moderateCompanyVerification(
      'admin-1', 'company-1', { status: 'VERIFIED' },
      { requestId: 'request-1', ipAddress: '127.0.0.1' },
      {
        runTransaction: (operation) => operation(database),
        findCompany,
        updateVerification,
        writeAudit,
        listRecruiters: vi.fn().mockResolvedValue(recruiters),
        createNotifications,
        queueMessage,
        now: () => changedAt,
      },
    )).resolves.toMatchObject({ verificationStatus: 'VERIFIED' });
    expect(updateVerification).toHaveBeenCalledWith(
      'company-1', 'PENDING', 'VERIFIED', changedAt, database,
    );
    expect(writeAudit).toHaveBeenCalledWith(expect.objectContaining({
      actorUserId: 'admin-1', action: 'COMPANY_VERIFICATION_CHANGED',
      metadata: { from: 'PENDING', to: 'VERIFIED', reason: null },
      requestId: 'request-1',
    }), database);
    expect(createNotifications).toHaveBeenCalledWith([expect.objectContaining({
      userId: 'recruiter-1', type: 'COMPANY_VERIFICATION_CHANGED',
    })], database);
    expect(queueMessage).toHaveBeenCalledWith(expect.objectContaining({
      template: 'company-verification-changed', recipient: 'recruiter@example.com',
    }), database);
  });

  it('keeps repeated company verification decisions idempotent', async () => {
    const updateVerification = vi.fn();
    await moderateCompanyVerification('admin-1', 'company-1', { status: 'VERIFIED' }, {}, {
      runTransaction: (operation) => operation(database),
      findCompany: vi.fn().mockResolvedValue(company('VERIFIED')),
      updateVerification,
    });
    expect(updateVerification).not.toHaveBeenCalled();
  });

  it('hides missing companies behind a generic not-found response', async () => {
    await expect(moderateCompanyVerification(
      'admin-1', 'missing-company', { status: 'REJECTED', reason: 'Invalid details.' }, {},
      {
        runTransaction: (operation) => operation(database),
        findCompany: vi.fn().mockResolvedValue(null),
      },
    )).rejects.toMatchObject({ code: 'NOT_FOUND', status: 404 });
  });

  it('detects concurrent company moderation before audit and notification writes', async () => {
    const writeAudit = vi.fn();
    await expect(moderateCompanyVerification(
      'admin-1', 'company-1', { status: 'VERIFIED' }, {},
      {
        runTransaction: (operation) => operation(database),
        findCompany: vi.fn().mockResolvedValue(company()),
        updateVerification: vi.fn().mockResolvedValue({ count: 0 }),
        writeAudit,
      },
    )).rejects.toMatchObject({ code: 'ADMIN_MODERATION_CONFLICT', status: 409 });
    expect(writeAudit).not.toHaveBeenCalled();
  });
});
