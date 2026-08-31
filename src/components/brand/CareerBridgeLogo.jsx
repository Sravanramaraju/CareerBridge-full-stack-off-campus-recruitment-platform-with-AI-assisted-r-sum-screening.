import { Link } from 'react-router-dom';
import { cn } from '@/src/lib/utils';

export function CareerBridgeMark({ className }) {
  return (
    <svg
      aria-hidden="true"
      className={cn('size-9 shrink-0', className)}
      viewBox="0 0 40 40"
      fill="none"
    >
      <rect width="40" height="40" rx="11" fill="var(--cb-primary)" />
      <path d="M9 27V17.5a2.5 2.5 0 0 1 5 0V27M26 27V17.5a2.5 2.5 0 0 1 5 0V27" stroke="white" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M13.5 21.5c3.5-5.2 9.5-5.2 13 0" stroke="#8DE1C2" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M11 27h18" stroke="white" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

export function CareerBridgeLogo({ to = '/', compact = false, className }) {
  return (
    <Link
      to={to}
      className={cn('inline-flex items-center gap-2.5 rounded-lg', className)}
      aria-label="CareerBridge home"
    >
      <CareerBridgeMark />
      {!compact && (
        <span className="font-heading text-[19px] font-extrabold tracking-[-0.03em] text-[var(--cb-text)]">
          Career<span className="text-[var(--cb-primary)]">Bridge</span>
        </span>
      )}
    </Link>
  );
}
