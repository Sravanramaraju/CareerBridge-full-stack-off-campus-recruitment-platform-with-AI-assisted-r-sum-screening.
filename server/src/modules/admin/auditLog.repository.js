import { prisma } from '../../lib/database.js';

export function createAuditLog(
  {
    actorUserId,
    action,
    entityType,
    entityId,
    metadata,
    requestId,
    ipAddress,
  },
  database = prisma,
) {
  return database.auditLog.create({
    data: {
      actorUserId: actorUserId || null,
      action,
      entityType,
      entityId,
      metadata: metadata || undefined,
      requestId: requestId || null,
      ipAddress: ipAddress || null,
    },
  });
}
