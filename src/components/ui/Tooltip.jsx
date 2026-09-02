import { useId } from 'react';

export function Tooltip({ label, children, side = 'bottom' }) {
  const tooltipId = useId();
  const position = side === 'top' ? 'bottom-full mb-2' : 'top-full mt-2';

  return (
    <span className="group relative inline-flex" aria-describedby={tooltipId}>
      {children}
      <span
        id={tooltipId}
        role="tooltip"
        className={`pointer-events-none absolute left-1/2 z-50 hidden w-max max-w-56 -translate-x-1/2 rounded-md bg-[var(--cb-text)] px-2.5 py-1.5 text-xs font-medium text-[var(--cb-surface)] shadow-[var(--cb-shadow-raised)] group-hover:block group-focus-within:block ${position}`}
      >
        {label}
      </span>
    </span>
  );
}
