import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { CheckCircle2, Info, X } from 'lucide-react';
import { cn } from '@/src/lib/utils';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);

  const showToast = useCallback((message, options = {}) => {
    window.clearTimeout(timerRef.current);
    setToast({ message, tone: options.tone || 'success' });
    timerRef.current = window.setTimeout(() => setToast(null), options.duration || 3200);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast && (
        <output className={cn('fixed inset-x-4 bottom-4 z-[80] mx-auto flex max-w-sm items-center gap-3 rounded-xl border bg-[var(--cb-surface-raised)] px-4 py-3 text-sm font-semibold shadow-[var(--cb-shadow-raised)] sm:right-5 sm:left-auto sm:mx-0', toast.tone === 'error' ? 'border-[var(--cb-danger)]' : 'border-[var(--cb-emerald)]')}>
          {toast.tone === 'error' ? <Info className="size-5 shrink-0 text-[var(--cb-danger)]" aria-hidden="true" /> : <CheckCircle2 className="size-5 shrink-0 text-[var(--cb-emerald)]" aria-hidden="true" />}
          <span className="flex-1">{toast.message}</span>
          <button type="button" onClick={() => setToast(null)} className="rounded-md p-1 text-[var(--cb-text-muted)] hover:bg-[var(--cb-bg-subtle)]" aria-label="Dismiss notification"><X className="size-4" /></button>
        </output>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider.');
  return context;
}
