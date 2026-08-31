import { cn } from '@/src/lib/utils';

function getInitials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export function Avatar({ name, size = 'md', className }) {
  const sizes = { sm: 'size-9 text-xs', md: 'size-11 text-sm', lg: 'size-16 text-lg' };
  return (
    <span
      className={cn('inline-flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[var(--cb-primary-soft)] font-semibold text-[var(--cb-primary)]', sizes[size], className)}
    >
      <span aria-label={`${name} initials`}>{getInitials(name)}</span>
    </span>
  );
}
