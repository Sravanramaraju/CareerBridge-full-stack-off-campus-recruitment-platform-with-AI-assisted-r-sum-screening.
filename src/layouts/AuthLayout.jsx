import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Link, Outlet } from 'react-router-dom';
import { CareerBridgeLogo } from '@/src/components/brand/CareerBridgeLogo';
import { ThemeToggle } from '@/src/components/navigation/ThemeToggle';

const benefits = [
  'Skills-first opportunity discovery',
  'Transparent application tracking',
  'Verified demo employer profiles',
];

export function AuthLayout() {
  return (
    <div className="grid min-h-screen bg-[var(--cb-bg)] lg:grid-cols-[44%_56%]">
      <aside className="brand-gradient-bg relative hidden overflow-hidden p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
        <svg className="absolute -bottom-12 -left-12 w-[620px] opacity-15" viewBox="0 0 620 360" fill="none" aria-hidden="true">
          <path d="M20 310h90c62 0 70-238 193-238h14c123 0 131 238 193 238h90" stroke="white" strokeWidth="4" />
          <path d="M100 310V165m420 145V165" stroke="white" strokeWidth="4" />
        </svg>
        <CareerBridgeLogo className="relative w-fit [&_span]:text-white [&_span_span]:text-white" />
        <div className="relative max-w-md">
          <p className="text-sm font-bold text-white/75">Your next step, made clearer</p>
          <h1 className="mt-3 font-heading text-4xl font-extrabold leading-tight tracking-[-0.04em]">One place to discover, apply, and keep moving forward.</h1>
          <ul className="mt-8 grid gap-3 text-sm text-white/85">
            {benefits.map((benefit) => <li key={benefit} className="flex items-center gap-3"><CheckCircle2 className="size-5 shrink-0 text-[#9ce5c9]" />{benefit}</li>)}
          </ul>
        </div>
        <p className="relative text-xs text-white/60">CareerBridge · Portfolio demonstration</p>
      </aside>
      <main className="flex min-h-screen flex-col">
        <header className="flex h-16 items-center justify-between border-b border-[var(--cb-divider)] px-5 sm:px-8 lg:justify-end">
          <CareerBridgeLogo className="lg:hidden" />
          <div className="flex items-center gap-2"><Link to="/" className="hidden items-center gap-2 text-sm font-semibold text-[var(--cb-text-secondary)] hover:text-[var(--cb-primary)] sm:flex"><ArrowLeft className="size-4" />Back home</Link><ThemeToggle /></div>
        </header>
        <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8"><Outlet /></div>
      </main>
    </div>
  );
}
