import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import { X } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { cn } from '@/src/lib/utils';

export const Drawer = DialogPrimitive.Root;
export const DrawerTrigger = DialogPrimitive.Trigger;
export const DrawerClose = DialogPrimitive.Close;

export function DrawerContent({ children, title, description, side = 'right', className }) {
  const position = side === 'bottom'
    ? 'inset-x-0 bottom-0 max-h-[88vh] rounded-t-2xl border-t data-ending-style:translate-y-full data-starting-style:translate-y-full'
    : 'inset-y-0 right-0 h-full w-[min(380px,88vw)] border-l data-ending-style:translate-x-full data-starting-style:translate-x-full';
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-[var(--cb-overlay)] transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0" />
      <DialogPrimitive.Popup className={cn('fixed z-50 overflow-y-auto bg-[var(--cb-surface-raised)] p-5 text-[var(--cb-text)] shadow-[var(--cb-shadow-raised)] outline-none transition-transform duration-200', position, className)}>
        <header className="mb-5 pr-10">
          <DialogPrimitive.Title className="font-heading text-lg font-bold">{title}</DialogPrimitive.Title>
          {description && <DialogPrimitive.Description className="mt-1 text-sm text-[var(--cb-text-secondary)]">{description}</DialogPrimitive.Description>}
        </header>
        {children}
        <DialogPrimitive.Close render={<Button variant="ghost" size="iconSm" className="absolute right-3 top-3" aria-label="Close panel" />}>
          <X aria-hidden="true" />
        </DialogPrimitive.Close>
      </DialogPrimitive.Popup>
    </DialogPrimitive.Portal>
  );
}
