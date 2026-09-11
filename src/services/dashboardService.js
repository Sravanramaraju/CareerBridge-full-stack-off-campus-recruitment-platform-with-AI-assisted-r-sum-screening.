import { apiClient } from '@/src/services/apiClient';

export const dashboardService = Object.freeze({
  getApplicantDashboard(options) {
    return apiClient.get('/applicant/dashboard', options);
  },
  getRecruiterDashboard(options) {
    return apiClient.get('/recruiter/dashboard', options);
  },
});
