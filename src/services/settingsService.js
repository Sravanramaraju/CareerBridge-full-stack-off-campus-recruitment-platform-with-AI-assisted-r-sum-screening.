import { apiClient } from '@/src/services/apiClient';

export const settingsService = Object.freeze({
  getSettings(options) {
    return apiClient.get('/settings', options);
  },
  updateSettings(updates, options) {
    return apiClient.patch('/settings', updates, options);
  },
});
