import { AppError, notFoundError } from '../../lib/appError.js';
import { prisma } from '../../lib/database.js';
import { createNotificationRecords } from '../notifications/notification.repository.js';
import { createAuditLog } from './auditLog.repository.js';
import { toAdminUser } from './adminUser.presenter.js';
import {
  findAdminUser,
  listAdminUsers,
  revokeUserSessions,
  updateUserStatus,
} from './adminUser.repository.js';

function moderationConflictError() {
  return new AppError({
    code: 'ADMIN_MODERATION_CONFLICT',
    message: 'This moderation record changed. Refresh and retry.',
    status: 409,
  });
}

function selfSuspensionError() {
  return new AppError({
    code: 'ADMIN_SELF_SUSPENSION',
    message: 'You cannot suspend your own administrator account.',
    status: 409,
  });
}

export async function getAdminUsers(filters, { listUsers = listAdminUsers } = {}) {
  const { users, total } = await listUsers(filters);
  return {
    items: users.map(toAdminUser),
    pagination: {
      page: filters.page,
      pageSize: filters.pageSize,
      total,
      totalPages: Math.ceil(total / filters.pageSize),
    },
  };
}

export async function moderateUserStatus(
  adminId,
  userId,
  input,
  auditContext = {},
  {
    runTransaction = (operation) => prisma.$transaction(operation),
    findUser = findAdminUser,
    updateStatus = updateUserStatus,
    revokeSessions = revokeUserSessions,
    writeAudit = createAuditLog,
    createNotifications = createNotificationRecords,
  } = {},
) {
  if (adminId === userId && input.status === 'SUSPENDED') throw selfSuspensionError();

  return runTransaction(async (database) => {
    const current = await findUser(userId, database);
    if (!current) throw notFoundError('The requested user was not found.');
    if (current.status === input.status) return toAdminUser(current);

    const result = await updateStatus(userId, current.status, input.status, database);
    if (result.count !== 1) throw moderationConflictError();
    if (input.status === 'SUSPENDED') await revokeSessions(userId, database);

    await writeAudit({
      actorUserId: adminId,
      action: 'USER_STATUS_CHANGED',
      entityType: 'USER',
      entityId: userId,
      metadata: {
        from: current.status,
        to: input.status,
        reason: input.reason || null,
      },
      ...auditContext,
    }, database);
    await createNotifications([{
      userId,
      type: 'SECURITY',
      title: 'Account status updated',
      message: input.status === 'SUSPENDED'
        ? 'Your CareerBridge account has been suspended.'
        : 'Your CareerBridge account has been reactivated.',
      entityType: 'USER',
      entityId: userId,
    }], database);

    return toAdminUser(await findUser(userId, database));
  });
}
