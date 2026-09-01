import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { APPLICATION_STATUSES } from '@/src/domain/constants';
import { mockApplications } from '@/src/data/mockData';

export const APP_STORAGE_KEY = 'careerbridge.mock.v1';

export const useAppStore = create(
  persist(
    (set, get) => ({
      session: null,
      savedJobIds: ['product-design-intern-paperplane', 'backend-engineer-clinivo'],
      applications: mockApplications,
      recruiterDrafts: [],
      recruiterNotes: {},
      profile: {
        name: 'Ananya Rao',
        email: 'applicant@careerbridge.demo',
        headline: 'Frontend developer focused on accessible product experiences',
        location: 'Bengaluru, Karnataka',
        summary: 'Early-career frontend developer who enjoys turning product requirements into accessible, dependable interfaces. Comfortable collaborating through feedback and documenting decisions clearly.',
        skills: ['React', 'JavaScript', 'CSS', 'Git'],
        education: [{ institution: 'Visvesvaraya Technological University', qualification: 'B.E. in Computer Science', period: '2022–2026' }],
        projects: [{ name: 'Campus Opportunity Tracker', description: 'Designed a responsive React dashboard for student placement updates and application status tracking.' }],
        experience: [],
        certifications: ['Responsive Web Design · freeCodeCamp'],
        preferences: { locations: ['Bengaluru', 'Hyderabad', 'Remote'], jobTypes: ['Full-time', 'Internship'], workModes: ['Hybrid', 'Remote'] },
        resumeName: 'Ananya_Rao_Resume.pdf',
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
