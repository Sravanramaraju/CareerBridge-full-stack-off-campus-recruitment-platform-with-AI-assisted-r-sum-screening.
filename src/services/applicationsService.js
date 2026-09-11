import { apiClient } from '@/src/services/apiClient';

export const applicationsService = Object.freeze({
  getApplicantApplications(options) {
    return apiClient.get('/applicant/applications', options);
  },
  getApplicantApplication(applicationId, options) {
    return apiClient.get(
      `/applicant/applications/${encodeURIComponent(applicationId)}`,
      options,
    );
  },
  applyToJob({ jobId, resumeId, coverNote = '', screeningAnswers = [] }, options) {
    return apiClient.post(`/jobs/${encodeURIComponent(jobId)}/applications`, {
      resumeId,
      coverNote: coverNote || null,
      screeningAnswers,
    }, options);
  },
  withdrawApplication(applicationId, options) {
    return apiClient.post(
      `/applicant/applications/${encodeURIComponent(applicationId)}/withdraw`,
      undefined,
      options,
    );
  },
});
