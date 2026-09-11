import { apiClient } from '@/src/services/apiClient';

export const savedJobsService = Object.freeze({
  getSavedJobs(options) {
    return apiClient.get('/applicant/saved-jobs', options);
  },
  saveJob(jobId, options) {
    return apiClient.put(`/applicant/saved-jobs/${encodeURIComponent(jobId)}`, undefined, options);
  },
  removeJob(jobId, options) {
    return apiClient.delete(`/applicant/saved-jobs/${encodeURIComponent(jobId)}`, options);
  },
});
