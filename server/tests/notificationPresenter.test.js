import { describe, expect, it } from 'vitest';
import { toNotification } from '../src/modules/notifications/notification.presenter.js';

describe('notification presenter', () => {
  it('returns a safe user-facing notification shape with derived read state', () => {
    const createdAt = new Date('2026-09-10T00:00:00.000Z');
    expect(toNotification({
      id: 'notification-1',
      userId: 'user-1',
      type: 'APPLICATION_STATUS_CHANGED',
      title: 'Application updated',
      message: 'Your application is now shortlisted.',
      entityType: 'APPLICATION',
      entityId: 'application-1',
      readAt: null,
      createdAt,
    })).toEqual({
      id: 'notification-1',
      type: 'APPLICATION_STATUS_CHANGED',
      title: 'Application updated',
      message: 'Your application is now shortlisted.',
      entityType: 'APPLICATION',
      entityId: 'application-1',
      readAt: null,
      isRead: false,
      createdAt,
    });
  });
});
