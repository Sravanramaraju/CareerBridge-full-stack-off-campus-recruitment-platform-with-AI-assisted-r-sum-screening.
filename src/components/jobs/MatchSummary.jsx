import { cn } from '@/src/lib/utils';

export function MatchSummary({ score, label = 'profile match', className }) {
  const safeScore = Math.min(100, Math.max(0, Number(score) || 0));
  const tone = safeScore >= 90 ? 'bg-[var(--cb-emerald)]' : safeScore >= 65 ? 'bg-[var(--cb-primary)]' : 'bg-[var(--cb-amber)]';

  return (
    <div className={cn('min-w-28', className)} title="Match is guidance based on job-related profile information.">
      <div className="flex items-center justify-between gap-2 text-xs">
        <strong>{safeScore}%</strong>
        <span className="text-[var(--cb-text-muted)]">{label}</span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[var(--cb-bg-subtle)]" aria-hidden="true">
        <div className={cn('h-full rounded-full', tone)} style={{ width: `${safeScore}%` }} />
      </div>
    </div>
  );
}
