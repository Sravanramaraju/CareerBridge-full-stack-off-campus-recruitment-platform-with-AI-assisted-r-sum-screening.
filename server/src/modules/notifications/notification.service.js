import { notFoundError } from '../../lib/appError.js';
import { prisma } from '../../lib/database.js';
import { toNotification } from './notification.presenter.js';
import {
  countUnreadUserNotifications,
  countUserNotifications,
  findUserNotification,
  listUserNotifications,
  markAllUserNotificationsRead,
  markUserNotificationRead,
} from './notification.repository.js';

export async function getUserNotifications(
  userId,
  filters,
  {
    runTransaction = (operation) => prisma.$transaction(operation),
    listNotifications = listUserNotifications,
    countNotifications = countUserNotifications,
    countUnread = countUnreadUserNotifications,
  } = {},
) {
  return runTransaction(async (database) => {
    const [notifications, total, unreadCount] = await Promise.all([
      listNotifications(userId, filters, database),
      countNotifications(userId, filters, database),
      countUnread(userId, database),
    ]);
    return {
      items: notifications.map(toNotification),
      unreadCount,
      pagination: {
        page: filters.page,
        pageSize: filters.pageSize,
        total,
        totalPages: Math.ceil(total / filters.pageSize),
      },
    };
  });
}

export async function readUserNotification(
  userId,
  notificationId,
  {
    runTransaction = (operation) => prisma.$transaction(operation),
    findNotification = findUserNotification,
    markRead = markUserNotificationRead,
    now = () => new Date(),
  } = {},
) {
  return runTransaction(async (database) => {
    const notification = await findNotification(notificationId, userId, database);
    if (!notification) throw notFoundError('The requested notification was not found.');
    if (notification.readAt) return toNotification(notification);

    const readAt = now();
    await markRead(notificationId, userId, readAt, database);
    return toNotification({ ...notification, readAt });
  });
}

export async function readAllUserNotifications(
  userId,
  {
    markAllRead = markAllUserNotificationsRead,
    now = () => new Date(),
  } = {},
) {
  const readAt = now();
  const result = await markAllRead(userId, readAt);
  return { updatedCount: result.count, readAt };
}
