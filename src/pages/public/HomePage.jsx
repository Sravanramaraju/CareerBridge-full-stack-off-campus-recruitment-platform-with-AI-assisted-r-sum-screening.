import { ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { JobCard } from '@/src/components/jobs/JobCard';
import { JobSearchBar } from '@/src/components/jobs/JobSearchBar';
import { buttonVariants } from '@/src/components/ui/Button';
import { jobs } from '@/src/data/mockData';

const browseChips = [
  'Fresher', 'Internship', 'Remote', 'Software Engineering', 'Data & Analytics',
  'Product', 'Finance', 'Sales', 'Graduate Programs',
];

export function HomePage() {
  const featuredJobs = jobs.filter((job) => job.featured).slice(0, 6);

  return (
    <>
      <section className="relative overflow-hidden border-b border-[var(--cb-divider)]">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute left-1/2 top-16 size-[440px] -translate-x-1/2 rounded-full bg-[var(--cb-primary-soft)] opacity-65 blur-3xl" />
          <svg className="absolute left-1/2 top-36 w-[min(980px,90vw)] -translate-x-1/2 opacity-35" viewBox="0 0 980 210" fill="none">
            <path d="M20 180h160c55 0 64-135 160-135h300c96 0 105 135 160 135h160" stroke="var(--cb-border-strong)" strokeWidth="2" strokeDasharray="7 9" />
          </svg>
        </div>
        <div className="page-container relative py-16 text-center sm:py-20 lg:py-24">
          <div className="mx-auto max-w-3xl">
            <p className="mx-auto inline-flex items-center gap-2 rounded-full border border-[var(--cb-border)] bg-[var(--cb-surface)] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-[var(--cb-primary)]">
              <CheckCircle2 className="size-4" aria-hidden="true" /> Built for early-career opportunities
            </p>
            <h1 className="mt-6 font-heading text-[34px] font-extrabold leading-[1.16] tracking-[-0.045em] sm:text-[40px] sm:leading-[1.18] lg:text-5xl lg:leading-[1.16]">
              Find the role that <span className="brand-gradient-text">moves your career forward.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[var(--cb-text-secondary)] sm:text-lg">
              Search verified openings, understand your match, and track every application from one place.
            </p>
          </div>

          <div className="mx-auto mt-9 max-w-5xl text-left">
            <JobSearchBar />
          </div>
          <div className="mx-auto mt-5 flex max-w-5xl flex-wrap justify-center gap-2">
            {browseChips.map((chip) => (
              <Link
                key={chip}
                to={`/jobs?q=${encodeURIComponent(chip)}`}
                className="rounded-full border border-[var(--cb-border)] bg-[var(--cb-surface)] px-3 py-1.5 text-xs font-semibold text-[var(--cb-text-secondary)] transition-colors hover:border-[var(--cb-primary)] hover:bg-[var(--cb-primary-soft)] hover:text-[var(--cb-primary)]"
              >
                {chip}
              </Link>
            ))}
          </div>
          <p className="mt-5 inline-flex items-center gap-2 text-xs font-medium text-[var(--cb-text-muted)]">
            <ShieldCheck className="size-4 text-[var(--cb-emerald)]" aria-hidden="true" />
            Built around skills, verified employers, and transparent applications
          </p>
        </div>
      </section>

      <section className="page-container py-16 sm:py-20" aria-labelledby="featured-jobs-title">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold text-[var(--cb-primary)]">Curated for your next step</p>
            <h2 id="featured-jobs-title" className="mt-2 font-heading text-3xl font-extrabold tracking-[-0.035em]">Featured opportunities</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--cb-text-secondary)]">Fresh roles from verified demo employers, selected for graduates and early-career professionals.</p>
          </div>
          <Link to="/jobs" className={buttonVariants({ variant: 'secondary', size: 'md' })}>
            View all jobs <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {featuredJobs.map((job) => <JobCard key={job.id} job={job} />)}
        </div>
      </section>
    </>
  );
}
