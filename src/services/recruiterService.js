import { apiClient } from '@/src/services/apiClient';
import { buildQueryString } from '@/src/services/queryString';

const encoded = encodeURIComponent;
const jobPath = (jobId, suffix = '') => `/recruiter/jobs/${encoded(jobId)}${suffix}`;
const applicationPath = (applicationId, suffix = '') => `/recruiter/applications/${encoded(applicationId)}${suffix}`;

export const recruiterService = Object.freeze({
  getCompany(options) {
    return apiClient.get('/recruiter/company', options);
  },
  updateCompany(updates, options) {
    return apiClient.patch('/recruiter/company', updates, options);
  },
  getJobs(options) {
    return apiClient.get('/recruiter/jobs', options);
  },
  getJob(jobId, options) {
    return apiClient.get(jobPath(jobId), options);
  },
  createJob(job, options) {
    return apiClient.post('/recruiter/jobs', job, options);
  },
  updateJob(jobId, job, options) {
    return apiClient.patch(jobPath(jobId), job, options);
  },
  publishJob(jobId, options) {
    return apiClient.post(jobPath(jobId, '/publish'), undefined, options);
  },
  closeJob(jobId, options) {
    return apiClient.post(jobPath(jobId, '/close'), undefined, options);
  },
  reopenJob(jobId, options) {
    return apiClient.post(jobPath(jobId, '/reopen'), undefined, options);
  },
  archiveJob(jobId, options) {
    return apiClient.delete(jobPath(jobId), options);
  },
  getCandidates(jobId, filters = {}, options) {
    return apiClient.get(`${jobPath(jobId, '/applications')}${buildQueryString(filters)}`, options);
  },
  getApplication(applicationId, options) {
    return apiClient.get(applicationPath(applicationId), options);
  },
  updateCandidateStatus(applicationId, status, reason, options) {
    return apiClient.patch(applicationPath(applicationId, '/status'), {
      status,
      reason: reason?.trim() || null,
    }, options);
  },
  getPrivateNotes(applicationId, options) {
    return apiClient.get(applicationPath(applicationId, '/notes'), options);
  },
  addPrivateNote(applicationId, body, options) {
    return apiClient.post(applicationPath(applicationId, '/notes'), { body }, options);
  },
  deletePrivateNote(noteId, options) {
    return apiClient.delete(`/recruiter/notes/${encoded(noteId)}`, options);
  },
});
