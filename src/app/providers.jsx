import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { ThemeProvider } from '@/src/features/theme/ThemeProvider';
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
      <ThemeProvider><ToastProvider>{children}</ToastProvider></ThemeProvider>
    </QueryClientProvider>
  );
}
