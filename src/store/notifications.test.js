import { beforeEach, describe, expect, it } from 'vitest';
import { useAppStore } from '@/src/store/useAppStore';

describe('notification state', () => {
  beforeEach(() => {
    useAppStore.setState({ readNotificationIds: [] });
  });

  it('marks an individual notification read only once', () => {
    useAppStore.getState().markNotificationRead('notification-1');
    useAppStore.getState().markNotificationRead('notification-1');

    expect(useAppStore.getState().readNotificationIds).toEqual(['notification-1']);
  });

  it('merges mark-all ids without duplicates', () => {
    useAppStore.getState().markNotificationRead('notification-1');
    useAppStore.getState().markAllNotificationsRead(['notification-1', 'notification-2']);

    expect(useAppStore.getState().readNotificationIds).toEqual(['notification-1', 'notification-2']);
  });
});
