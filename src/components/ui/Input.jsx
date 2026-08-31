import { forwardRef, useId } from 'react';
import { cn } from '@/src/lib/utils';

export const Input = forwardRef(function Input({ className, error, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        'h-[42px] w-full rounded-[10px] border border-[var(--cb-border-strong)] bg-[var(--cb-surface)] px-3.5 text-sm text-[var(--cb-text)] outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-[var(--cb-text-muted)] focus:border-[var(--cb-primary)] focus:ring-3 focus:ring-[var(--cb-focus)] disabled:cursor-not-allowed disabled:bg-[var(--cb-bg-subtle)] disabled:opacity-70',
        error && 'border-[var(--cb-danger)] focus:border-[var(--cb-danger)] focus:ring-[color-mix(in_srgb,var(--cb-danger)_20%,transparent)]',
        className,
      )}
      aria-invalid={Boolean(error)}
      {...props}
    />
  );
});

export const TextArea = forwardRef(function TextArea({ className, error, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(
        'min-h-28 w-full resize-y rounded-[10px] border border-[var(--cb-border-strong)] bg-[var(--cb-surface)] px-3.5 py-3 text-sm text-[var(--cb-text)] outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-[var(--cb-text-muted)] focus:border-[var(--cb-primary)] focus:ring-3 focus:ring-[var(--cb-focus)]',
        error && 'border-[var(--cb-danger)] focus:border-[var(--cb-danger)]',
        className,
      )}
      aria-invalid={Boolean(error)}
      {...props}
    />
  );
});

export const Select = forwardRef(function Select({ className, error, children, ...props }, ref) {
  return (
    <select
      ref={ref}
      className={cn(
        'h-[42px] w-full rounded-[10px] border border-[var(--cb-border-strong)] bg-[var(--cb-surface)] px-3.5 text-sm text-[var(--cb-text)] outline-none focus:border-[var(--cb-primary)] focus:ring-3 focus:ring-[var(--cb-focus)]',
        error && 'border-[var(--cb-danger)]',
        className,
      )}
      aria-invalid={Boolean(error)}
      {...props}
    >
      {children}
    </select>
  );
});

export function FormField({ id: providedId, label, required, error, helper, children, className }) {
  const generatedId = useId();
  const id = providedId || generatedId;
  const messageId = `${id}-message`;

  return (
    <div className={cn('grid gap-1.5', className)}>
      <label htmlFor={id} className="text-[13px] font-semibold text-[var(--cb-text-secondary)]">
        {label}
        {required && <span className="ml-1 text-[var(--cb-danger)]" aria-hidden="true">*</span>}
      </label>
      {typeof children === 'function'
        ? children({ id, 'aria-describedby': error || helper ? messageId : undefined, error })
        : children}
      {(error || helper) && (
        <p id={messageId} className={cn('text-xs', error ? 'text-[var(--cb-danger)]' : 'text-[var(--cb-text-muted)]')}>
          {error || helper}
        </p>
      )}
    </div>
  );
}
