import { prisma } from '../../lib/database.js';

export async function createNotificationRecords(notifications, database = prisma) {
  if (notifications.length === 0) return { count: 0 };
  return database.notification.createMany({ data: notifications });
}
