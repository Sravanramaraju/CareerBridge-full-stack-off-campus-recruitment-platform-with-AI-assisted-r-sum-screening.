import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { cva } from 'class-variance-authority';
import { cn } from '@/src/lib/utils';

export const buttonVariants = cva(
  'inline-flex shrink-0 items-center justify-center gap-2 rounded-[10px] border text-sm font-semibold transition-[background-color,border-color,color,transform] duration-150 outline-none focus-visible:ring-3 focus-visible:ring-[var(--cb-focus)] active:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-[18px] [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary:
          'border-transparent bg-[var(--cb-primary)] text-white hover:bg-[var(--cb-primary-hover)] active:bg-[var(--cb-primary-pressed)]',
        secondary:
          'border-[var(--cb-border)] bg-[var(--cb-surface)] text-[var(--cb-text)] hover:border-[var(--cb-border-strong)] hover:bg-[var(--cb-bg-subtle)]',
        soft: 'border-transparent bg-[var(--cb-primary-soft)] text-[var(--cb-primary)] hover:bg-[var(--cb-primary-soft-hover)]',
        ghost: 'border-transparent bg-transparent text-[var(--cb-text-secondary)] hover:bg-[var(--cb-bg-subtle)] hover:text-[var(--cb-text)]',
        danger: 'border-transparent bg-[var(--cb-danger)] text-white hover:bg-[var(--cb-danger-hover)]',
        dangerSoft: 'border-transparent bg-[var(--cb-danger-soft)] text-[var(--cb-danger)] hover:brightness-95',
        link: 'h-auto border-transparent bg-transparent p-0 text-[var(--cb-primary)] hover:underline hover:underline-offset-4',
        hero: 'border-transparent brand-gradient-bg text-white hover:brightness-105',
      },
      size: {
        sm: 'h-[34px] px-3',
        md: 'h-10 px-4',
        lg: 'h-11 px-5',
        hero: 'h-12 rounded-xl px-5',
        icon: 'size-10 px-0',
        iconSm: 'size-9 px-0',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

export function Button({ className, variant, size, ...props }) {
  return <ButtonPrimitive className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
