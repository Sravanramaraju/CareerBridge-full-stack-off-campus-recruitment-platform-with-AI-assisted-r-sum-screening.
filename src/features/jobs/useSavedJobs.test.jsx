import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider } from '@/src/components/feedback/ToastProvider';
import { useSavedJobs } from '@/src/features/jobs/useSavedJobs';
import { queryKeys } from '@/src/services/queryKeys';
import { useAppStore } from '@/src/store/useAppStore';

const savedJobsService = vi.hoisted(() => ({
  getSavedJobs: vi.fn(),
  saveJob: vi.fn(),
  removeJob: vi.fn(),
}));
vi.mock('@/src/services/savedJobsService', () => ({ savedJobsService }));

function createWrapper(initialEntries = ['/jobs?location=Pune']) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}><ToastProvider>{children}</ToastProvider></MemoryRouter>
    </QueryClientProvider>
  );
  return { queryClient, wrapper };
}

describe('useSavedJobs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAppStore.setState({ session: null, sessionStatus: 'anonymous' });
  });

  it('does not load account saved jobs for a guest', () => {
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useSavedJobs(), { wrapper });

    expect(result.current.savedJobs).toEqual([]);
    expect(savedJobsService.getSavedJobs).not.toHaveBeenCalled();
  });

  it('loads saved jobs and removes a saved role for an applicant', async () => {
    useAppStore.setState({
      session: { id: 'applicant-1', role: 'applicant' },
      sessionStatus: 'authenticated',
    });
    savedJobsService.getSavedJobs
      .mockResolvedValueOnce([{ id: 'job-1' }])
      .mockResolvedValueOnce([]);
    savedJobsService.removeJob.mockResolvedValue({ jobId: 'job-1', saved: false });
    const { queryClient, wrapper } = createWrapper();
    const { result } = renderHook(() => useSavedJobs(), { wrapper });
    await waitFor(() => expect(result.current.savedJobIds.has('job-1')).toBe(true));

    act(() => result.current.toggleSavedJob('job-1'));
    await waitFor(() => expect(savedJobsService.removeJob).toHaveBeenCalledWith('job-1'));
    await waitFor(() => expect(queryClient.getQueryData(queryKeys.savedJobs())).toEqual([]));
  });
});
