import { apiClient } from '@/src/services/apiClient';

function recordPath(collection, recordId) {
  return `/applicant/${collection}/${encodeURIComponent(recordId)}`;
}

function recordOperations(collection) {
  const basePath = `/applicant/${collection}`;
  return Object.freeze({
    create(values, options) {
      return apiClient.post(basePath, values, options);
    },
    update(recordId, values, options) {
      return apiClient.patch(recordPath(collection, recordId), values, options);
    },
    remove(recordId, options) {
      return apiClient.delete(recordPath(collection, recordId), options);
    },
  });
}

export const profilesService = Object.freeze({
  getApplicantProfile(options) {
    return apiClient.get('/applicant/profile', options);
  },
  updateApplicantProfile(updates, options) {
    return apiClient.patch('/applicant/profile', updates, options);
  },
  replaceSkills(skills, options) {
    return apiClient.put('/applicant/skills', { skills }, options);
  },
  education: recordOperations('education'),
  experience: recordOperations('experience'),
  projects: recordOperations('projects'),
  certifications: recordOperations('certifications'),
});
