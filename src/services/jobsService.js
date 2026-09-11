import { apiClient } from '@/src/services/apiClient';
import { buildQueryString } from '@/src/services/queryString';

const JOB_FILTER_ALIASES = Object.freeze({ keyword: 'q' });

export const jobsService = Object.freeze({
  getJobs(filters = {}, options) {
    return apiClient.get(`/jobs${buildQueryString(filters, JOB_FILTER_ALIASES)}`, options);
  },
  getJobById(jobId, options) {
    return apiClient.get(`/jobs/${encodeURIComponent(jobId)}`, options);
  },
  getJobMatch(jobId, options) {
    return apiClient.get(`/jobs/${encodeURIComponent(jobId)}/match`, options);
  },
  getCompanyJobs(companyId, filters = {}, options) {
    return apiClient.get(
      `/companies/${encodeURIComponent(companyId)}/jobs${buildQueryString(filters)}`,
      options,
    );
  },
});
