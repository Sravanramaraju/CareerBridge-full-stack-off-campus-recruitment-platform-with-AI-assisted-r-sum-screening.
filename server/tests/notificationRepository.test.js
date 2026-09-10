import { describe, expect, it, vi } from 'vitest';
import {
  countUnreadUserNotifications,
  countUserNotifications,
  createNotificationRecords,
  findUserNotification,
  listUserNotifications,
  markAllUserNotificationsRead,
  markUserNotificationRead,
} from '../src/modules/notifications/notification.repository.js';

describe('notification repository', () => {
  it('creates a focused batch of user-owned notifications', async () => {
    const createMany = vi.fn().mockResolvedValue({ count: 2 });
    const notifications = [
      {
        userId: 'applicant-1',
        type: 'APPLICATION_SUBMITTED',
        title: 'Application submitted',
        message: 'Your application was submitted.',
        entityType: 'APPLICATION',
        entityId: 'application-1',
      },
      {
        userId: 'recruiter-1',
        type: 'APPLICATION_RECEIVED',
        title: 'New application',
        message: 'A candidate applied to your role.',
        entityType: 'APPLICATION',
        entityId: 'application-1',
      },
    ];

    await createNotificationRecords(notifications, { notification: { createMany } });
    expect(createMany).toHaveBeenCalledWith({ data: notifications });
  });

  it('skips empty notification batches', async () => {
    await expect(createNotificationRecords([], {})).resolves.toEqual({ count: 0 });
  });

  it('lists only authenticated-user notifications with server pagination', async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    await listUserNotifications('user-1', {
      page: 2, pageSize: 10, unreadOnly: true,
    }, { notification: { findMany } });
    expect(findMany).toHaveBeenCalledWith({
      where: { userId: 'user-1', readAt: null },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      skip: 10,
      take: 10,
    });
  });

  it('counts filtered and unread notification totals independently', async () => {
    const count = vi.fn().mockResolvedValue(3);
    const database = { notification: { count } };
    await countUserNotifications('user-1', {
      page: 1, pageSize: 20, unreadOnly: false,
    }, database);
    await countUnreadUserNotifications('user-1', database);
    expect(count).toHaveBeenNthCalledWith(1, { where: { userId: 'user-1' } });
    expect(count).toHaveBeenNthCalledWith(2, { where: { userId: 'user-1', readAt: null } });
  });

  it('finds and marks one notification through user ownership', async () => {
    const findFirst = vi.fn().mockResolvedValue({ id: 'notification-1' });
    const updateMany = vi.fn().mockResolvedValue({ count: 1 });
    const database = { notification: { findFirst, updateMany } };
    const readAt = new Date('2026-09-10T00:00:00.000Z');
    await findUserNotification('notification-1', 'user-1', database);
    await markUserNotificationRead('notification-1', 'user-1', readAt, database);
    expect(findFirst).toHaveBeenCalledWith({
      where: { id: 'notification-1', userId: 'user-1' },
    });
    expect(updateMany).toHaveBeenCalledWith({
      where: { id: 'notification-1', userId: 'user-1', readAt: null },
      data: { readAt },
    });
  });

  it('marks every unread user-owned notification without touching other users', async () => {
    const updateMany = vi.fn().mockResolvedValue({ count: 2 });
    const readAt = new Date('2026-09-10T00:00:00.000Z');
    await markAllUserNotificationsRead('user-1', readAt, { notification: { updateMany } });
    expect(updateMany).toHaveBeenCalledWith({
      where: { userId: 'user-1', readAt: null },
      data: { readAt },
    });
  });
});
