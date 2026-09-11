import { create } from 'zustand';

export const useAppStore = create((set) => ({
  session: null,
  sessionStatus: 'loading',
  setSession: (session) => set({
    session,
    sessionStatus: session ? 'authenticated' : 'anonymous',
  }),
  setSessionStatus: (sessionStatus) => set({ sessionStatus }),
  logout: () => set({ session: null, sessionStatus: 'anonymous' }),
}));
