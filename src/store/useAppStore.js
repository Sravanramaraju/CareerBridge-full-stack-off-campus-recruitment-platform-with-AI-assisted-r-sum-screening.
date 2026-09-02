import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { APPLICATION_STATUSES } from '@/src/domain/constants';
import { mockApplications, recruiterCandidates } from '@/src/data/mockData';
import { adminCompanyReviews, adminJobReviews, adminUsers } from '@/src/data/adminData';

export const APP_STORAGE_KEY = 'careerbridge.mock.v1';

export const useAppStore = create(
  persist(
    (set, get) => ({
      session: null,
      savedJobIds: ['product-design-intern-paperplane', 'backend-engineer-clinivo'],
      applications: mockApplications,
      recruiterDrafts: [],
      recruiterJobStates: {},
      recruiterNotes: {},
      candidateStatuses: Object.fromEntries(recruiterCandidates.map((candidate) => [candidate.applicationId, candidate.status])),
      candidateStatusHistory: Object.fromEntries(recruiterCandidates.map((candidate) => [candidate.applicationId, [{ status: candidate.status, changedAt: candidate.appliedAt }]])),
      companyProfile: {
        name: 'Northstar Labs',
        industry: 'Developer tools',
        website: 'https://northstarlabs.example',
        size: '201–500 employees',
        about: 'Northstar Labs builds reliable developer infrastructure for fast-moving product teams.',
        benefits: ['Learning budget', 'Flexible hybrid work', 'Health coverage'],
        locations: ['Bengaluru', 'Remote within India'],
        verificationStatus: 'Verified',
      },
      readNotificationIds: [],
      adminCompanyStates: Object.fromEntries(adminCompanyReviews.map((company) => [company.id, company.status])),
      adminJobStates: Object.fromEntries(adminJobReviews.map((job) => [job.id, job.state])),
      adminUserStates: Object.fromEntries(adminUsers.map((user) => [user.id, user.state])),
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
      updateCandidateStatus: (applicationId, status) => set((state) => {
        if (state.candidateStatuses[applicationId] === status) return state;
        return {
          candidateStatuses: { ...state.candidateStatuses, [applicationId]: status },
          candidateStatusHistory: {
            ...state.candidateStatusHistory,
            [applicationId]: [...(state.candidateStatusHistory[applicationId] || []), { status, changedAt: new Date().toISOString() }],
          },
        };
      }),
      updateCompanyProfile: (updates) => set((state) => ({ companyProfile: { ...state.companyProfile, ...updates } })),
      markNotificationRead: (notificationId) => set((state) => ({ readNotificationIds: state.readNotificationIds.includes(notificationId) ? state.readNotificationIds : [...state.readNotificationIds, notificationId] })),
      markAllNotificationsRead: (notificationIds) => set((state) => ({ readNotificationIds: [...new Set([...state.readNotificationIds, ...notificationIds])] })),
      setAdminCompanyState: (companyId, status) => set((state) => ({ adminCompanyStates: { ...state.adminCompanyStates, [companyId]: status } })),
      setAdminJobState: (jobId, status) => set((state) => ({ adminJobStates: { ...state.adminJobStates, [jobId]: status } })),
      setAdminUserState: (userId, status) => set((state) => ({ adminUserStates: { ...state.adminUserStates, [userId]: status } })),
      updateProfile: (updates) => set((state) => ({ profile: { ...state.profile, ...updates } })),
      saveRecruiterDraft: (draft) => set((state) => ({
        recruiterDrafts: [
          { ...draft, id: draft.id || `draft-${Date.now()}`, updatedAt: new Date().toISOString() },
          ...state.recruiterDrafts.filter((item) => item.id !== draft.id),
        ],
      })),
      setRecruiterJobState: (jobId, status) => set((state) => ({ recruiterJobStates: { ...state.recruiterJobStates, [jobId]: status } })),
      deleteRecruiterDraft: (jobId) => set((state) => ({ recruiterDrafts: state.recruiterDrafts.filter((item) => item.id !== jobId) })),
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
        recruiterJobStates: state.recruiterJobStates,
        recruiterNotes: state.recruiterNotes,
        candidateStatuses: state.candidateStatuses,
        candidateStatusHistory: state.candidateStatusHistory,
        companyProfile: state.companyProfile,
        readNotificationIds: state.readNotificationIds,
        adminCompanyStates: state.adminCompanyStates,
        adminJobStates: state.adminJobStates,
        adminUserStates: state.adminUserStates,
        profile: state.profile,
      }),
    },
  ),
);
