import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import { X } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { cn } from '@/src/lib/utils';

export const Modal = DialogPrimitive.Root;
export const ModalTrigger = DialogPrimitive.Trigger;
export const ModalClose = DialogPrimitive.Close;

export function ModalContent({ children, className, title, description }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-[var(--cb-overlay)] backdrop-blur-[2px] transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0" />
      <DialogPrimitive.Popup
        className={cn(
          'fixed left-1/2 top-1/2 z-50 max-h-[calc(100vh-32px)] w-[min(560px,calc(100%-32px))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border bg-[var(--cb-surface-raised)] p-6 text-[var(--cb-text)] shadow-[var(--cb-shadow-raised)] outline-none transition duration-200 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0',
          className,
        )}
      >
        <header className="mb-5 pr-10">
          <DialogPrimitive.Title className="font-heading text-xl font-bold">{title}</DialogPrimitive.Title>
          {description && <DialogPrimitive.Description className="mt-1.5 text-sm text-[var(--cb-text-secondary)]">{description}</DialogPrimitive.Description>}
        </header>
        {children}
        <DialogPrimitive.Close render={<Button variant="ghost" size="iconSm" className="absolute right-3 top-3" aria-label="Close dialog" />}>
          <X aria-hidden="true" />
        </DialogPrimitive.Close>
      </DialogPrimitive.Popup>
    </DialogPrimitive.Portal>
  );
}
