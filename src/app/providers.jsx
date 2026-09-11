import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { ThemeProvider } from '@/src/features/theme/ThemeProvider';
import { AuthProvider } from '@/src/features/auth/AuthProvider';
import { ToastProvider } from '@/src/components/feedback/ToastProvider';

export function AppProviders({ children }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider><ToastProvider>{children}</ToastProvider></ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
