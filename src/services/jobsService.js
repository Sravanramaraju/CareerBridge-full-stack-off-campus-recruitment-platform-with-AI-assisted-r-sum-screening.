import { catalogService } from '@/src/services/mockApi';

export const jobsService = Object.freeze({
  getJobs(filters = {}) {
    return catalogService.listJobs(filters);
  },
  getJobById(jobId) {
    return catalogService.getJob(jobId);
  },
});
