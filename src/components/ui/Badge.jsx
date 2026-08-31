import { cn } from '@/src/lib/utils';

const variants = {
  neutral: 'border-[var(--cb-border)] bg-[var(--cb-bg-subtle)] text-[var(--cb-text-secondary)]',
  primary: 'border-transparent bg-[var(--cb-primary-soft)] text-[var(--cb-primary)]',
  success: 'border-transparent bg-[var(--cb-emerald-soft)] text-[var(--cb-emerald)]',
  warning: 'border-transparent bg-[var(--cb-amber-soft)] text-[var(--cb-amber)]',
  danger: 'border-transparent bg-[var(--cb-danger-soft)] text-[var(--cb-danger)]',
  info: 'border-transparent bg-[var(--cb-info-soft)] text-[var(--cb-info)]',
};

export function Badge({ variant = 'neutral', className, children, ...props }) {
  return (
    <span
      className={cn('inline-flex min-h-6 items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold', variants[variant], className)}
      {...props}
    >
      {children}
    </span>
  );
}
