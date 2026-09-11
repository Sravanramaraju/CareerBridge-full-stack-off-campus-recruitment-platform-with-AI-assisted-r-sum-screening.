import { apiClient } from '@/src/services/apiClient';
import { buildQueryString } from '@/src/services/queryString';

export const notificationsService = Object.freeze({
  getNotifications(filters = {}, options) {
    return apiClient.get(`/notifications${buildQueryString(filters)}`, options);
  },
  markRead(notificationId, options) {
    return apiClient.patch(
      `/notifications/${encodeURIComponent(notificationId)}/read`, undefined, options,
    );
  },
  markAllRead(options) {
    return apiClient.patch('/notifications/read-all', undefined, options);
  },
});
