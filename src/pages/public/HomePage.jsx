import {
  ArrowRight, BadgeCheck, BookOpen, CheckCircle2, ClipboardCheck, Clock3,
  FileSearch, SearchCheck, Send, ShieldCheck, Sparkles, UserRoundCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { CompanyCard } from '@/src/components/companies/CompanyCard';
import { JobCard } from '@/src/components/jobs/JobCard';
import { JobSearchBar } from '@/src/components/jobs/JobSearchBar';
import { buttonVariants } from '@/src/components/ui/Button';
import { careerResources, companies, jobs } from '@/src/data/mockData';
import { useAppStore } from '@/src/store/useAppStore';

const browseChips = [
  'Fresher', 'Internship', 'Remote', 'Software Engineering', 'Data & Analytics',
  'Product', 'Finance', 'Sales', 'Graduate Programs',
];

const principles = [
  {
    icon: Sparkles,
    title: 'Skill-aware matches',
    description: 'Compare the strengths in your profile with the requirements that matter for each role.',
  },
  {
    icon: BadgeCheck,
    title: 'Verified recruiters',
    description: 'Prioritise trustworthy company profiles with clear roles and accountable hiring teams.',
  },
  {
    icon: ClipboardCheck,
    title: 'Application clarity',
    description: 'Follow every application from submission to final outcome without losing the thread.',
  },
];

const candidateFlow = [
  { icon: UserRoundCheck, label: 'Profile', copy: 'Show your skills, projects, education, and preferences once.' },
  { icon: SearchCheck, label: 'Discover', copy: 'Explore focused opportunities and understand your fit.' },
  { icon: Send, label: 'Apply', copy: 'Submit a clear application with the right profile context.' },
  { icon: FileSearch, label: 'Track', copy: 'See status changes and next steps in one reliable timeline.' },
];

export function HomePage() {
  const featuredJobs = jobs.filter((job) => job.featured).slice(0, 6);
  const savedJobIds = useAppStore((state) => state.savedJobIds);
  const toggleSavedJob = useAppStore((state) => state.toggleSavedJob);

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
          {featuredJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              isSaved={savedJobIds.includes(job.id)}
              onSave={toggleSavedJob}
            />
          ))}
        </div>
      </section>

      <section className="border-y border-[var(--cb-divider)] bg-[var(--cb-bg-subtle)] py-16 sm:py-20" aria-labelledby="companies-title">
        <div className="page-container">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold text-[var(--cb-emerald)]">Know where you&apos;re applying</p>
              <h2 id="companies-title" className="mt-2 font-heading text-3xl font-extrabold tracking-[-0.035em]">Top companies hiring</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--cb-text-secondary)]">Explore transparent profiles from fictional, verified demo employers.</p>
            </div>
            <Link className="inline-flex items-center gap-2 text-sm font-bold text-[var(--cb-primary)] hover:underline" to="/companies">
              Explore all companies <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {companies.slice(0, 4).map((company) => <CompanyCard key={company.id} company={company} />)}
          </div>
        </div>
      </section>

      <section id="about" className="page-container py-16 sm:py-20" aria-labelledby="principles-title">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold text-[var(--cb-primary)]">Opportunities built around your start</p>
          <h2 id="principles-title" className="mt-2 font-heading text-3xl font-extrabold tracking-[-0.035em]">Clarity at every important decision</h2>
          <p className="mt-3 text-sm leading-6 text-[var(--cb-text-secondary)]">The useful parts of a job portal, organised around what early-career candidates actually need.</p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {principles.map(({ icon: Icon, title, description }) => (
            <article key={title} className="border-t-2 border-[var(--cb-primary)] bg-[var(--cb-surface)] p-6 shadow-[var(--cb-shadow-card)]">
              <div className="grid size-11 place-items-center rounded-xl bg-[var(--cb-primary-soft)] text-[var(--cb-primary)]"><Icon aria-hidden="true" /></div>
              <h3 className="mt-5 font-heading text-lg font-bold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--cb-text-secondary)]">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="border-y border-[var(--cb-divider)] bg-[var(--cb-surface)] py-16 sm:py-20" aria-labelledby="flow-title">
        <div className="page-container">
          <div className="max-w-2xl">
            <p className="text-sm font-bold text-[var(--cb-emerald)]">One connected journey</p>
            <h2 id="flow-title" className="mt-2 font-heading text-3xl font-extrabold tracking-[-0.035em]">A clearer path from profile to offer</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--cb-text-secondary)]">Spend less time rebuilding context and more time taking the next meaningful step.</p>
          </div>
          <ol className="relative mt-10 grid gap-5 md:grid-cols-4">
            <div className="absolute left-[12.5%] right-[12.5%] top-7 hidden border-t-2 border-dashed border-[var(--cb-border-strong)] md:block" aria-hidden="true" />
            {candidateFlow.map(({ icon: Icon, label, copy }, index) => (
              <li key={label} className="relative bg-[var(--cb-surface)]">
                <div className="flex items-center gap-4 md:block">
                  <div className="relative z-10 grid size-14 shrink-0 place-items-center rounded-2xl border border-[var(--cb-border)] bg-[var(--cb-bg)] text-[var(--cb-primary)] shadow-[var(--cb-shadow-card)] md:mx-auto">
                    <Icon aria-hidden="true" />
                  </div>
                  <div className="md:mt-5 md:text-center">
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--cb-text-muted)]">Step {index + 1}</p>
                    <h3 className="mt-1 font-heading text-lg font-bold">{label}</h3>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-6 text-[var(--cb-text-secondary)] md:text-center">{copy}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="page-container py-16 sm:py-20">
        <div className="brand-gradient-bg relative overflow-hidden rounded-[20px] px-6 py-10 text-white sm:px-10 lg:flex lg:items-center lg:justify-between lg:gap-10 lg:px-14 lg:py-12">
          <svg className="absolute -right-12 -top-20 w-[430px] opacity-20" viewBox="0 0 430 220" fill="none" aria-hidden="true">
            <path d="M20 190h60c38 0 44-145 120-145h40c76 0 82 145 120 145h50" stroke="white" strokeWidth="3" />
            <path d="M74 190V95m292 95V95" stroke="white" strokeWidth="3" />
          </svg>
          <div className="relative max-w-2xl">
            <p className="text-sm font-bold text-white/80">Hiring emerging talent?</p>
            <h2 className="mt-2 font-heading text-3xl font-extrabold tracking-[-0.035em]">Meet candidates through evidence, not noise.</h2>
            <p className="mt-3 text-sm leading-6 text-white/80">Publish thoughtful roles, review skill-aligned profiles, and keep every candidate informed.</p>
          </div>
          <Link to="/signup/recruiter" className="relative mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-bold text-[#1a409f] shadow-sm transition-transform hover:-translate-y-0.5 lg:mt-0">
            Start recruiting <ArrowRight aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className="page-container pb-16 sm:pb-20" aria-labelledby="resources-title">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold text-[var(--cb-primary)]">Practical career support</p>
            <h2 id="resources-title" className="mt-2 font-heading text-3xl font-extrabold tracking-[-0.035em]">Prepare with more confidence</h2>
          </div>
          <Link className="inline-flex items-center gap-2 text-sm font-bold text-[var(--cb-primary)] hover:underline" to="/resources">View all resources <ArrowRight className="size-4" aria-hidden="true" /></Link>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {careerResources.map((resource) => (
            <article key={resource.id} className="surface-card flex flex-col p-6">
              <div className="flex items-center justify-between gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-[var(--cb-cyan-soft)] text-[var(--cb-cyan-strong)]"><BookOpen className="size-5" aria-hidden="true" /></span>
                <span className="inline-flex items-center gap-1.5 text-xs text-[var(--cb-text-muted)]"><Clock3 className="size-3.5" aria-hidden="true" />{resource.readTime}</span>
              </div>
              <p className="mt-5 text-xs font-bold uppercase tracking-[0.1em] text-[var(--cb-primary)]">{resource.category}</p>
              <h3 className="mt-2 font-heading text-lg font-bold leading-6">{resource.title}</h3>
              <p className="mt-3 text-sm leading-6 text-[var(--cb-text-secondary)]">{resource.description}</p>
              <Link className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[var(--cb-primary)] hover:underline" to="/resources">Read guide <ArrowRight className="size-4" aria-hidden="true" /></Link>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
