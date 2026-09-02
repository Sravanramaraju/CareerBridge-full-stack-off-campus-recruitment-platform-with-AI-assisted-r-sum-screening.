import { mockMutation, mockResponse } from '@/src/services/mockTransport';
import { useAppStore } from '@/src/store/useAppStore';

export const applicationsService = Object.freeze({
  getApplicantApplications() {
    return mockResponse(useAppStore.getState().applications);
  },
  applyToJob({ jobId, coverNote = '' }) {
    return mockMutation(() => useAppStore.getState().submitApplication(jobId, coverNote));
  },
  updateApplicationStatus(applicationId, status) {
    return mockMutation(() => {
      useAppStore.getState().updateApplicationStatus(applicationId, status);
      return useAppStore.getState().applications.find((item) => item.id === applicationId) || null;
    });
  },
});
