import { cn } from '@/src/lib/utils';

export function PageHeader({ eyebrow, title, description, actions, className }) {
  return (
    <header className={cn('flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div>
        {eyebrow && <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--cb-primary)]">{eyebrow}</p>}
        <h1 className="font-heading text-[28px] font-bold leading-[1.25] sm:text-[30px]">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm text-[var(--cb-text-secondary)]">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </header>
  );
}
