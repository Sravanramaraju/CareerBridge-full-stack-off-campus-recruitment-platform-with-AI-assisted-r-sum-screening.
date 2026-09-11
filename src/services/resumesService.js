import { apiClient } from '@/src/services/apiClient';

function resumePath(resumeId, suffix = '') {
  return `/applicant/resumes/${encodeURIComponent(resumeId)}${suffix}`;
}

export const resumesService = Object.freeze({
  getResumes(options) {
    return apiClient.get('/applicant/resumes', options);
  },
  uploadResume(file, options) {
    const formData = new FormData();
    formData.append('resume', file);
    return apiClient.post('/applicant/resumes', formData, options);
  },
  setPrimaryResume(resumeId, options) {
    return apiClient.patch(resumePath(resumeId, '/primary'), undefined, options);
  },
  deleteResume(resumeId, options) {
    return apiClient.delete(resumePath(resumeId), options);
  },
  contentUrl(resumeId) {
    return `/api/v1/resumes/${encodeURIComponent(resumeId)}/content`;
  },
});
