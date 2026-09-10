import { describe, expect, it, vi } from 'vitest';
import {
  getUserNotifications,
  readAllUserNotifications,
  readUserNotification,
} from '../src/modules/notifications/notification.service.js';

const database = { marker: 'transaction-client' };
const now = new Date('2026-09-10T00:00:00.000Z');
const notification = {
  id: 'notification-1', userId: 'user-1', type: 'SECURITY', title: 'Security update',
  message: 'Your password changed.', entityType: null, entityId: null,
  readAt: null, createdAt: now,
};

describe('notification service', () => {
  it('returns user notifications with filtered and unread totals', async () => {
    const filters = { page: 2, pageSize: 10, unreadOnly: false };
    const result = await getUserNotifications('user-1', filters, {
      runTransaction: (operation) => operation(database),
      listNotifications: vi.fn().mockResolvedValue([notification]),
      countNotifications: vi.fn().mockResolvedValue(11),
      countUnread: vi.fn().mockResolvedValue(4),
    });
    expect(result).toEqual({
      items: [expect.objectContaining({ id: 'notification-1', isRead: false })],
      unreadCount: 4,
      pagination: { page: 2, pageSize: 10, total: 11, totalPages: 2 },
    });
  });

  it('marks an owned unread notification at a single timestamp', async () => {
    const markRead = vi.fn().mockResolvedValue({ count: 1 });
    const result = await readUserNotification('user-1', 'notification-1', {
      runTransaction: (operation) => operation(database),
      findNotification: vi.fn().mockResolvedValue(notification),
      markRead,
      now: () => now,
    });
    expect(markRead).toHaveBeenCalledWith('notification-1', 'user-1', now, database);
    expect(result).toMatchObject({ id: 'notification-1', isRead: true, readAt: now });
  });

  it('keeps repeated read requests idempotent', async () => {
    const markRead = vi.fn();
    const readAt = new Date('2026-09-09T00:00:00.000Z');
    const result = await readUserNotification('user-1', 'notification-1', {
      runTransaction: (operation) => operation(database),
      findNotification: vi.fn().mockResolvedValue({ ...notification, readAt }),
      markRead,
    });
    expect(markRead).not.toHaveBeenCalled();
    expect(result.readAt).toEqual(readAt);
  });

  it('hides foreign notification ownership behind not found', async () => {
    await expect(readUserNotification('user-1', 'foreign-notification', {
      runTransaction: (operation) => operation(database),
      findNotification: vi.fn().mockResolvedValue(null),
    })).rejects.toMatchObject({ code: 'NOT_FOUND', status: 404 });
  });

  it('marks all unread notifications for the authenticated user', async () => {
    const markAllRead = vi.fn().mockResolvedValue({ count: 3 });
    await expect(readAllUserNotifications('user-1', {
      markAllRead,
      now: () => now,
    })).resolves.toEqual({ updatedCount: 3, readAt: now });
    expect(markAllRead).toHaveBeenCalledWith('user-1', now);
  });
});
