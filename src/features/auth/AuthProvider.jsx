import { useEffect } from 'react';
import { authService } from '@/src/services/authService';
import { useAppStore } from '@/src/store/useAppStore';

export function AuthProvider({ children }) {
  const setSession = useAppStore((state) => state.setSession);
  const setSessionStatus = useAppStore((state) => state.setSessionStatus);

  useEffect(() => {
    const controller = new AbortController();
    setSessionStatus('loading');
    authService.getCurrentSession({ signal: controller.signal })
      .then((session) => setSession(session))
      .catch((error) => {
        if (error?.name !== 'AbortError') setSession(null);
      });
    return () => controller.abort();
  }, [setSession, setSessionStatus]);

  return children;
}
