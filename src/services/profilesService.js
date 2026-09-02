import { mockMutation, mockResponse } from '@/src/services/mockTransport';
import { useAppStore } from '@/src/store/useAppStore';

export const profilesService = Object.freeze({
  getApplicantProfile() {
    return mockResponse(useAppStore.getState().profile);
  },
  updateApplicantProfile(updates) {
    return mockMutation(() => {
      useAppStore.getState().updateProfile(updates);
      return useAppStore.getState().profile;
    });
  },
});
