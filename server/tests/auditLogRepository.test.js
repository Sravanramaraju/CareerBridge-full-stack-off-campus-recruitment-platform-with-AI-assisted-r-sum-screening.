import { describe, expect, it, vi } from 'vitest';
import { createAuditLog } from '../src/modules/admin/auditLog.repository.js';

describe('audit log repository', () => {
  it('persists administrative actor, target, change metadata, and request context', async () => {
    const create = vi.fn().mockResolvedValue({ id: 'audit-1' });
    await createAuditLog({
      actorUserId: 'admin-1',
      action: 'COMPANY_VERIFICATION_CHANGED',
      entityType: 'COMPANY',
      entityId: 'company-1',
      metadata: { from: 'PENDING', to: 'VERIFIED' },
      requestId: 'request-1',
      ipAddress: '127.0.0.1',
    }, { auditLog: { create } });
    expect(create).toHaveBeenCalledWith({
      data: {
        actorUserId: 'admin-1',
        action: 'COMPANY_VERIFICATION_CHANGED',
        entityType: 'COMPANY',
        entityId: 'company-1',
        metadata: { from: 'PENDING', to: 'VERIFIED' },
        requestId: 'request-1',
        ipAddress: '127.0.0.1',
      },
    });
  });

  it('normalizes optional audit context for system actions', async () => {
    const create = vi.fn().mockResolvedValue({ id: 'audit-1' });
    await createAuditLog({
      action: 'SECURITY_EVENT', entityType: 'USER', entityId: 'user-1',
    }, { auditLog: { create } });
    expect(create).toHaveBeenCalledWith({ data: expect.objectContaining({
      actorUserId: null, metadata: undefined, requestId: null, ipAddress: null,
    }) });
  });
});
