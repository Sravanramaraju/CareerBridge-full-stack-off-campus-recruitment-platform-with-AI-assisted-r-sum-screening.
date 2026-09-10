import { describe, expect, it, vi } from 'vitest';
import {
  createListNotificationsHandler,
  createReadAllNotificationsHandler,
  createReadNotificationHandler,
} from '../src/modules/notifications/notification.controller.js';

describe('notification controller', () => {
  it('lists notifications for the authenticated user and validated filters', async () => {
    const data = { items: [], unreadCount: 0, pagination: { total: 0 } };
    const listNotifications = vi.fn().mockResolvedValue(data);
    const response = { json: vi.fn((value) => value) };
    const query = { page: 1, pageSize: 20 };
    await createListNotificationsHandler({ listNotifications })(
      { auth: { user: { id: 'user-1' } }, validated: { query } },
      response,
      vi.fn(),
    );
    expect(listNotifications).toHaveBeenCalledWith('user-1', query);
    expect(response.json).toHaveBeenCalledWith({ data });
  });

  it('marks one validated user-owned notification read', async () => {
    const notification = { id: 'notification-1', isRead: true };
    const readNotification = vi.fn().mockResolvedValue(notification);
    const response = { json: vi.fn((value) => value) };
    await createReadNotificationHandler({ readNotification })(
      {
        auth: { user: { id: 'user-1' } },
        validated: { params: { notificationId: 'notification-1' } },
      },
      response,
      vi.fn(),
    );
    expect(readNotification).toHaveBeenCalledWith('user-1', 'notification-1');
    expect(response.json).toHaveBeenCalledWith({ data: notification });
  });

  it('marks all unread notifications for the authenticated user', async () => {
    const data = { updatedCount: 2 };
    const readAllNotifications = vi.fn().mockResolvedValue(data);
    const response = { json: vi.fn((value) => value) };
    await createReadAllNotificationsHandler({ readAllNotifications })(
      { auth: { user: { id: 'user-1' } } }, response, vi.fn(),
    );
    expect(readAllNotifications).toHaveBeenCalledWith('user-1');
    expect(response.json).toHaveBeenCalledWith({ data });
  });

  it('forwards notification failures to centralized error handling', async () => {
    const error = new Error('database unavailable');
    const next = vi.fn();
    await createListNotificationsHandler({
      listNotifications: vi.fn().mockRejectedValue(error),
    })(
      { auth: { user: { id: 'user-1' } }, validated: { query: {} } },
      { json: vi.fn() },
      next,
    );
    expect(next).toHaveBeenCalledWith(error);
  });
});
