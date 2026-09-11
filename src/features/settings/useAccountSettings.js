import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/src/components/feedback/ToastProvider';
import { queryKeys } from '@/src/services/queryKeys';
import { settingsService } from '@/src/services/settingsService';

export function useAccountSettings() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const query = useQuery({
    queryKey: queryKeys.settings(),
    queryFn: ({ signal }) => settingsService.getSettings({ signal }),
  });
  const mutation = useMutation({
    mutationFn: (updates) => settingsService.updateSettings(updates),
    onMutate: async (updates) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.settings() });
      const previous = queryClient.getQueryData(queryKeys.settings());
      queryClient.setQueryData(queryKeys.settings(), (current) => ({ ...current, ...updates }));
      return { previous };
    },
    onSuccess: (settings) => queryClient.setQueryData(queryKeys.settings(), settings),
    onError: (error, _updates, context) => {
      queryClient.setQueryData(queryKeys.settings(), context?.previous);
      showToast(error instanceof Error ? error.message : 'Unable to update settings.', { tone: 'error' });
    },
  });

  return {
    error: query.error,
    isLoading: query.isLoading,
    refetch: query.refetch,
    settings: query.data,
    updateSetting: (key, value) => mutation.mutate({ [key]: value }),
  };
}
