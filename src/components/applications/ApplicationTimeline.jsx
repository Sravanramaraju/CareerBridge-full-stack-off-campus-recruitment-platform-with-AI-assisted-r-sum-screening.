import { Check, X } from 'lucide-react';
import { cn } from '@/src/lib/utils';

const progressStages = ['Applied', 'Screening', 'Assessment', 'Interview', 'Offer'];

export function ApplicationTimeline({ application }) {
  const isRejected = ['Rejected', 'Not selected'].includes(application.status);
  const priorStatus = application.timeline.at(-2)?.status;
  const currentIndex = isRejected ? Math.max(0, progressStages.indexOf(priorStatus)) : progressStages.indexOf(application.status);

  return (
    <ol className="mt-6">
      {progressStages.map((stage, index) => {
        const event = application.timeline.find((item) => item.status === stage);
        const completed = index < currentIndex || (application.status === 'Offer' && index <= currentIndex);
        const current = !isRejected && index === currentIndex && application.status !== 'Offer';
        return (
          <li key={stage} className="relative flex gap-4 pb-7 last:pb-0">
            {index < progressStages.length - 1 && <span className={cn('absolute left-[15px] top-8 h-[calc(100%-16px)] w-0.5', completed ? 'bg-[var(--cb-emerald)]' : 'bg-[var(--cb-border)]')} aria-hidden="true" />}
            <span className={cn('relative z-10 grid size-8 shrink-0 place-items-center rounded-full border-2', completed ? 'border-[var(--cb-emerald)] bg-[var(--cb-emerald)] text-white' : current ? 'border-[var(--cb-primary)] bg-[var(--cb-primary)] text-white' : 'border-[var(--cb-border-strong)] bg-[var(--cb-surface)] text-[var(--cb-text-muted)]')}>{completed || current ? <Check className="size-4" aria-hidden="true" /> : <span className="size-2 rounded-full bg-current" />}</span>
            <div><h3 className={cn('text-sm font-bold', !event && !current && 'text-[var(--cb-text-muted)]')}>{stage === 'Offer' ? 'Offer / final outcome' : stage}</h3><p className="mt-1 text-xs leading-5 text-[var(--cb-text-secondary)]">{event ? event.note : current ? 'This is the current stage.' : 'No update yet.'}</p>{event && <time className="mt-1 block text-[10px] text-[var(--cb-text-muted)]" dateTime={event.date}>{new Date(event.date).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}</time>}</div>
          </li>
        );
      })}
      {isRejected && <li className="mt-6 flex gap-4 border-t border-[var(--cb-divider)] pt-6"><span className="grid size-8 shrink-0 place-items-center rounded-full bg-[var(--cb-danger)] text-white"><X className="size-4" aria-hidden="true" /></span><div><h3 className="text-sm font-bold text-[var(--cb-danger)]">Not selected</h3><p className="mt-1 text-xs leading-5 text-[var(--cb-text-secondary)]">{application.timeline.at(-1)?.note}</p></div></li>}
    </ol>
  );
}
