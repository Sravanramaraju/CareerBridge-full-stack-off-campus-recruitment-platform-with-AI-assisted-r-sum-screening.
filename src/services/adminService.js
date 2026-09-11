import { apiClient } from '@/src/services/apiClient';
import { buildQueryString } from '@/src/services/queryString';

const encoded = encodeURIComponent;

export const adminService = Object.freeze({
  getDashboard(options) {
    return apiClient.get('/admin/dashboard', options);
  },
  getCompanies(filters = {}, options) {
    return apiClient.get(`/admin/companies${buildQueryString(filters)}`, options);
  },
  updateCompanyVerification(companyId, status, reason, options) {
    return apiClient.patch(`/admin/companies/${encoded(companyId)}/verification`, {
      status,
      reason: reason?.trim() || null,
    }, options);
  },
  getJobs(filters = {}, options) {
    return apiClient.get(`/admin/jobs${buildQueryString(filters)}`, options);
  },
  updateJobModeration(jobId, action, reason, options) {
    return apiClient.patch(`/admin/jobs/${encoded(jobId)}/moderation`, {
      action,
      reason: reason?.trim() || null,
    }, options);
  },
  getUsers(filters = {}, options) {
    return apiClient.get(`/admin/users${buildQueryString(filters)}`, options);
  },
  updateUserStatus(userId, status, reason, options) {
    return apiClient.patch(`/admin/users/${encoded(userId)}/status`, {
      status,
      reason: reason?.trim() || null,
    }, options);
  },
});
