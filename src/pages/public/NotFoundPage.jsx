import { ArrowLeft, SearchX } from 'lucide-react';
import { Link } from 'react-router-dom';
import { buttonVariants } from '@/src/components/ui/Button';

export function NotFoundPage() {
  return (
    <section className="page-container grid min-h-[64vh] place-items-center py-16 text-center">
      <div>
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[var(--cb-primary-soft)] text-[var(--cb-primary)]"><SearchX aria-hidden="true" /></span>
        <p className="mt-5 font-heading text-sm font-extrabold tracking-[0.16em] text-[var(--cb-primary)]">404</p>
        <h1 className="mt-2 font-heading text-3xl font-extrabold tracking-[-0.035em]">This path doesn&apos;t lead anywhere yet</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--cb-text-secondary)]">The page may have moved, or the link may be incomplete. Return home or continue exploring opportunities.</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link to="/" className={buttonVariants({ variant: 'secondary', size: 'lg' })}><ArrowLeft />Back home</Link>
          <Link to="/jobs" className={buttonVariants({ variant: 'primary', size: 'lg' })}>Browse jobs</Link>
        </div>
      </div>
    </section>
  );
}
