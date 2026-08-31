import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { APPLICATION_STATUSES } from '@/src/domain/constants';

export const APP_STORAGE_KEY = 'careerbridge.mock.v1';

export const useAppStore = create(
  persist(
    (set, get) => ({
      session: null,
      savedJobIds: [],
      applications: [],
      recruiterDrafts: [],
      recruiterNotes: {},
      profile: {
        name: 'Ananya Rao',
        headline: 'Frontend developer focused on accessible product experiences',
        location: 'Bengaluru, Karnataka',
        skills: ['React', 'JavaScript', 'CSS', 'Git'],
        profileCompletion: 78,
      },

      setSession: (session) => set({ session }),
      logout: () => set({ session: null }),
      toggleSavedJob: (jobId) => set((state) => ({
        savedJobIds: state.savedJobIds.includes(jobId)
          ? state.savedJobIds.filter((id) => id !== jobId)
          : [...state.savedJobIds, jobId],
      })),
      submitApplication: (jobId, coverNote = '') => {
        if (get().applications.some((application) => application.jobId === jobId)) return null;
        const application = {
          id: `application-${Date.now()}`,
          jobId,
          applicantId: 'demo-applicant',
          status: APPLICATION_STATUSES.APPLIED,
          coverNote,
          appliedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          timeline: [{ status: APPLICATION_STATUSES.APPLIED, date: new Date().toISOString(), note: 'Application submitted successfully.' }],
        };
        set((state) => ({ applications: [application, ...state.applications] }));
        return application;
      },
      updateApplicationStatus: (applicationId, status) => set((state) => ({
        applications: state.applications.map((application) => application.id === applicationId
          ? {
              ...application,
              status,
              updatedAt: new Date().toISOString(),
              timeline: [...application.timeline, { status, date: new Date().toISOString(), note: `Application moved to ${status}.` }],
            }
          : application),
      })),
      updateProfile: (updates) => set((state) => ({ profile: { ...state.profile, ...updates } })),
      saveRecruiterDraft: (draft) => set((state) => ({
        recruiterDrafts: [
          { ...draft, id: draft.id || `draft-${Date.now()}`, updatedAt: new Date().toISOString() },
          ...state.recruiterDrafts.filter((item) => item.id !== draft.id),
        ],
      })),
      addRecruiterNote: (applicationId, note) => set((state) => ({
        recruiterNotes: {
          ...state.recruiterNotes,
          [applicationId]: [...(state.recruiterNotes[applicationId] || []), { id: Date.now(), note, createdAt: new Date().toISOString() }],
        },
      })),
    }),
    {
      name: APP_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        session: state.session,
        savedJobIds: state.savedJobIds,
        applications: state.applications,
        recruiterDrafts: state.recruiterDrafts,
        recruiterNotes: state.recruiterNotes,
        profile: state.profile,
      }),
    },
  ),
);
