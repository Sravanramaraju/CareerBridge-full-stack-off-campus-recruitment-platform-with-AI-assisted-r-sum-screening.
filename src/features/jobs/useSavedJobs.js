import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '@/src/components/feedback/ToastProvider';
import { queryKeys } from '@/src/services/queryKeys';
import { savedJobsService } from '@/src/services/savedJobsService';
import { useAppStore } from '@/src/store/useAppStore';

const EMPTY_SAVED_JOBS = [];

export function useSavedJobs() {
  const session = useAppStore((state) => state.session);
  const queryClient = useQueryClient();
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const isApplicant = session?.role === 'applicant';
  const savedJobsQuery = useQuery({
    queryKey: queryKeys.savedJobs(),
    queryFn: ({ signal }) => savedJobsService.getSavedJobs({ signal }),
    enabled: isApplicant,
  });
  const savedJobs = savedJobsQuery.data || EMPTY_SAVED_JOBS;
  const savedJobIds = useMemo(() => new Set(savedJobs.map((job) => job.id)), [savedJobs]);

  const mutation = useMutation({
    mutationFn: ({ jobId, saved }) => saved
      ? savedJobsService.removeJob(jobId)
      : savedJobsService.saveJob(jobId),
    onMutate: async ({ jobId, saved }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.savedJobs() });
      const previous = queryClient.getQueryData(queryKeys.savedJobs());
      queryClient.setQueryData(queryKeys.savedJobs(), (current = []) => saved
        ? current.filter((job) => job.id !== jobId)
        : current);
      return { previous };
    },
    onSuccess: (_result, { saved }) => {
      showToast(saved ? 'Removed from saved jobs.' : 'Job saved.');
    },
    onError: (error, _variables, context) => {
      queryClient.setQueryData(queryKeys.savedJobs(), context?.previous);
      showToast(error instanceof Error ? error.message : 'Unable to update saved jobs.', { tone: 'error' });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.savedJobs() }),
  });

  function toggleSavedJob(jobId) {
    if (!isApplicant) {
      const returnUrl = `${location.pathname}${location.search}${location.hash}`;
      void navigate(`/login?redirect=${encodeURIComponent(returnUrl)}`);
      return;
    }
    mutation.mutate({ jobId, saved: savedJobIds.has(jobId) });
  }

  return {
    isApplicant,
    isLoading: savedJobsQuery.isLoading,
    savedJobs,
    savedJobIds,
    toggleSavedJob,
  };
}
