import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/src/components/feedback/ToastProvider';
import { authService } from '@/src/services/authService';
import { useAppStore } from '@/src/store/useAppStore';

export function useLogout() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const clearSession = useAppStore((state) => state.logout);
  const { showToast } = useToast();
  const mutation = useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      queryClient.clear();
      clearSession();
      void navigate('/', { replace: true });
    },
    onError: (error) => showToast(
      error instanceof Error ? error.message : 'Unable to log out. Please try again.',
      { tone: 'error' },
    ),
  });

  return {
    logout: mutation.mutate,
    isLoggingOut: mutation.isPending,
  };
}
