import { BriefcaseBusiness } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { cn } from '@/src/lib/utils';

export function Skeleton({ className }) {
  return <div aria-hidden="true" className={cn('animate-pulse rounded-lg bg-[var(--cb-bg-subtle)]', className)} />;
}

export function EmptyState({ icon: Icon = BriefcaseBusiness, title, description, actionLabel, onAction, className }) {
  return (
    <section className={cn('flex flex-col items-center rounded-2xl border bg-[var(--cb-surface)] px-6 py-12 text-center', className)}>
      <span className="grid size-11 place-items-center rounded-xl bg-[var(--cb-bg-subtle)] text-[var(--cb-text-secondary)]">
        <Icon size={22} aria-hidden="true" />
      </span>
      <h2 className="mt-4 font-heading text-lg font-bold">{title}</h2>
      <p className="mt-1 max-w-sm text-sm text-[var(--cb-text-secondary)]">{description}</p>
      {actionLabel && <Button className="mt-5" onClick={onAction}>{actionLabel}</Button>}
    </section>
  );
}

export function ProgressBar({ value, label, className }) {
  const safeValue = Math.min(100, Math.max(0, value));
  return (
    <div className={cn('grid gap-1.5', className)}>
      {label && <div className="flex justify-between text-xs text-[var(--cb-text-secondary)]"><span>{label}</span><span>{safeValue}%</span></div>}
      <progress
        className="h-2 w-full overflow-hidden rounded-full accent-[var(--cb-primary)] [&::-moz-progress-bar]:bg-[var(--cb-primary)] [&::-webkit-progress-bar]:bg-[var(--cb-bg-subtle)] [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:bg-[var(--cb-primary)]"
        value={safeValue}
        max="100"
        aria-label={label || 'Progress'}
      />
    </div>
  );
}
