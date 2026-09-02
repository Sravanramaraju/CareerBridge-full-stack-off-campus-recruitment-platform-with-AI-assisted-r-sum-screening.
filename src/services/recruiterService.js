import { recruiterCandidates } from '@/src/data/mockData';
import { mockMutation, mockResponse } from '@/src/services/mockTransport';
import { useAppStore } from '@/src/store/useAppStore';

export const recruiterService = Object.freeze({
  getCandidates(jobId) {
    return mockResponse(recruiterCandidates.filter((candidate) => !jobId || candidate.jobId === jobId));
  },
  saveJob(job) {
    return mockMutation(() => useAppStore.getState().saveRecruiterDraft(job));
  },
  updateCandidateStatus(applicationId, status) {
    return mockMutation(() => useAppStore.getState().updateCandidateStatus(applicationId, status));
  },
  addPrivateNote(applicationId, note) {
    return mockMutation(() => useAppStore.getState().addRecruiterNote(applicationId, note));
  },
});
