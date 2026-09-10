import { prisma } from '../../lib/database.js';

export async function createNotificationRecords(notifications, database = prisma) {
  if (notifications.length === 0) return { count: 0 };
  return database.notification.createMany({ data: notifications });
}

export function listUserNotifications(userId, filters, database = prisma) {
  return database.notification.findMany({
    where: {
      userId,
      ...(filters.unreadOnly ? { readAt: null } : {}),
    },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    skip: (filters.page - 1) * filters.pageSize,
    take: filters.pageSize,
  });
}

export function countUserNotifications(userId, filters, database = prisma) {
  return database.notification.count({
    where: {
      userId,
      ...(filters.unreadOnly ? { readAt: null } : {}),
    },
  });
}

export function countUnreadUserNotifications(userId, database = prisma) {
  return database.notification.count({ where: { userId, readAt: null } });
}

export function findUserNotification(notificationId, userId, database = prisma) {
  return database.notification.findFirst({ where: { id: notificationId, userId } });
}

export function markUserNotificationRead(notificationId, userId, readAt, database = prisma) {
  return database.notification.updateMany({
    where: { id: notificationId, userId, readAt: null },
    data: { readAt },
  });
}

export function markAllUserNotificationsRead(userId, readAt, database = prisma) {
  return database.notification.updateMany({
    where: { userId, readAt: null },
    data: { readAt },
  });
}
