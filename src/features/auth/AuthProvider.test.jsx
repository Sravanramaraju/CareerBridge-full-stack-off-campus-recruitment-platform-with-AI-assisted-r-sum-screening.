import { render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider } from '@/src/features/auth/AuthProvider';
import { useAppStore } from '@/src/store/useAppStore';

const getCurrentSession = vi.hoisted(() => vi.fn());
vi.mock('@/src/services/authService', () => ({
  authService: { getCurrentSession },
}));

describe('AuthProvider', () => {
  beforeEach(() => {
    getCurrentSession.mockReset();
    useAppStore.setState({ session: null, sessionStatus: 'loading' });
  });

  it('restores the current server session from cookies', async () => {
    getCurrentSession.mockResolvedValue({ id: 'user-1', role: 'applicant' });
    render(<AuthProvider><p>CareerBridge</p></AuthProvider>);
    await waitFor(() => expect(useAppStore.getState()).toMatchObject({
      session: { id: 'user-1', role: 'applicant' },
      sessionStatus: 'authenticated',
    }));
    expect(getCurrentSession).toHaveBeenCalledWith({ signal: expect.any(AbortSignal) });
  });

  it('settles as anonymous when no valid session exists', async () => {
    getCurrentSession.mockRejectedValue(new Error('Unauthenticated'));
    render(<AuthProvider><p>CareerBridge</p></AuthProvider>);
    await waitFor(() => expect(useAppStore.getState().sessionStatus).toBe('anonymous'));
    expect(useAppStore.getState().session).toBeNull();
  });
});
