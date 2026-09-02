import { mockNotifications, recruiterNotifications } from '@/src/data/mockData';
import { mockMutation, mockResponse } from '@/src/services/mockTransport';
import { useAppStore } from '@/src/store/useAppStore';

export const notificationsService = Object.freeze({
  getNotifications(role) {
    return mockResponse(role === 'recruiter' ? recruiterNotifications : mockNotifications);
  },
  markRead(notificationId) {
    return mockMutation(() => useAppStore.getState().markNotificationRead(notificationId));
  },
  markAllRead(notificationIds) {
    return mockMutation(() => useAppStore.getState().markAllNotificationsRead(notificationIds));
  },
});
