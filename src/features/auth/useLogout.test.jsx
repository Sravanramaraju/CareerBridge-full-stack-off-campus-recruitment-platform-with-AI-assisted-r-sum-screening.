import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider } from '@/src/components/feedback/ToastProvider';
import { useLogout } from '@/src/features/auth/useLogout';
import { useAppStore } from '@/src/store/useAppStore';

const logoutRequest = vi.hoisted(() => vi.fn());
vi.mock('@/src/services/authService', () => ({
  authService: { logout: logoutRequest },
}));

describe('useLogout', () => {
  beforeEach(() => {
    logoutRequest.mockReset();
    useAppStore.setState({
      session: { id: 'user-1', role: 'applicant' },
      sessionStatus: 'authenticated',
    });
  });

  it('revokes the server session and clears all user-scoped query data', async () => {
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    queryClient.setQueryData(['applicant', 'profile'], { id: 'profile-1' });
    logoutRequest.mockResolvedValue({ loggedOut: true });
    const wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter><ToastProvider>{children}</ToastProvider></MemoryRouter>
      </QueryClientProvider>
    );
    const { result } = renderHook(() => useLogout(), { wrapper });

    act(() => result.current.logout());
    await waitFor(() => expect(useAppStore.getState().sessionStatus).toBe('anonymous'));
    expect(logoutRequest).toHaveBeenCalledOnce();
    expect(queryClient.getQueryData(['applicant', 'profile'])).toBeUndefined();
    expect(useAppStore.getState().session).toBeNull();
  });
});
