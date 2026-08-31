import { ArrowRight, BookOpen, CheckCircle2, Clock3, FileText, MessagesSquare, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/src/components/ui/Badge';
import { buttonVariants } from '@/src/components/ui/Button';
import { careerResources } from '@/src/data/mockData';

const toolkit = [
  ['Target the role', 'Choose a small, coherent set of roles and learn what evidence they consistently require.'],
  ['Make proof easy to find', 'Lead with outcomes, relevant skills, and links that help a reviewer understand your work quickly.'],
  ['Prepare useful stories', 'Practise concise examples of learning, collaboration, decisions, and measurable impact.'],
  ['Track your pipeline', 'Record applications, follow-ups, interviews, and reflection notes while context is fresh.'],
];

const resourceIcons = [FileText, MessagesSquare, Target, BookOpen, MessagesSquare, CheckCircle2];

export function ResourcesPage() {
  return (
    <>
      <section className="border-b border-[var(--cb-divider)] bg-[var(--cb-surface)]">
        <div className="page-container grid gap-9 py-14 sm:py-18 lg:grid-cols-[1fr_380px] lg:items-center">
          <div className="max-w-2xl">
            <Badge variant="primary">Career resources</Badge>
            <h1 className="mt-5 font-heading text-4xl font-extrabold leading-tight tracking-[-0.045em]">Practical guidance for your first important career moves</h1>
            <p className="mt-4 text-base leading-7 text-[var(--cb-text-secondary)]">Clear, actionable guides for stronger applications, calmer interviews, and more informed decisions—without inflated promises.</p>
            <Link to="/jobs" className={`${buttonVariants({ variant: 'primary', size: 'lg' })} mt-7`}>Explore open roles <ArrowRight aria-hidden="true" /></Link>
          </div>
          <div className="relative hidden min-h-64 lg:block" aria-hidden="true">
            <div className="absolute inset-0 rounded-[24px] border border-[var(--cb-border)] bg-[var(--cb-bg-subtle)]" />
            <div className="absolute left-7 right-16 top-8 rounded-xl border bg-[var(--cb-surface)] p-5 shadow-[var(--cb-shadow-raised)]">
              <div className="h-2 w-20 rounded-full bg-[var(--cb-primary-soft-hover)]" /><div className="mt-4 h-3 w-4/5 rounded-full bg-[var(--cb-border)]" /><div className="mt-2 h-3 w-3/5 rounded-full bg-[var(--cb-border)]" />
            </div>
            <div className="absolute bottom-8 left-16 right-7 rounded-xl border bg-[var(--cb-surface)] p-5 shadow-[var(--cb-shadow-raised)]">
              <div className="flex gap-2"><span className="size-5 rounded-full bg-[var(--cb-emerald-soft)]" /><div className="h-3 w-1/2 rounded-full bg-[var(--cb-border)]" /></div><div className="mt-3 h-2 w-full rounded-full bg-[var(--cb-bg-subtle)]"><div className="h-full w-3/4 rounded-full bg-[var(--cb-emerald)]" /></div>
            </div>
          </div>
        </div>
      </section>

      <section className="page-container py-14 sm:py-18" aria-labelledby="guides-title">
        <div className="max-w-2xl">
          <p className="text-sm font-bold text-[var(--cb-primary)]">Guides you can use today</p>
          <h2 id="guides-title" className="mt-2 font-heading text-3xl font-extrabold tracking-[-0.035em]">Build confidence through preparation</h2>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {careerResources.map((resource, index) => {
            const Icon = resourceIcons[index];
            return (
              <article key={resource.id} className="surface-card flex flex-col p-6">
                <span className="grid size-11 place-items-center rounded-xl bg-[var(--cb-primary-soft)] text-[var(--cb-primary)]"><Icon aria-hidden="true" /></span>
                <p className="mt-5 text-xs font-bold uppercase tracking-[0.1em] text-[var(--cb-primary)]">{resource.category}</p>
                <h3 className="mt-2 font-heading text-lg font-bold leading-6">{resource.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[var(--cb-text-secondary)]">{resource.description}</p>
                <div className="mt-auto flex items-center justify-between border-t border-[var(--cb-divider)] pt-5 text-xs text-[var(--cb-text-muted)]">
                  <span className="inline-flex items-center gap-1.5"><Clock3 className="size-3.5" />{resource.readTime}</span>
                  <span className="font-bold text-[var(--cb-primary)]">Read guide</span>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="border-t border-[var(--cb-divider)] bg-[var(--cb-bg-subtle)] py-14 sm:py-18">
        <div className="page-container grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <p className="text-sm font-bold text-[var(--cb-emerald)]">A sustainable weekly system</p>
            <h2 className="mt-2 font-heading text-3xl font-extrabold tracking-[-0.035em]">Keep your search focused and visible</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--cb-text-secondary)]">Progress is easier to maintain when each step is small, specific, and recorded.</p>
          </div>
          <ol className="surface-card divide-y divide-[var(--cb-divider)] px-6">
            {toolkit.map(([title, copy], index) => (
              <li key={title} className="flex gap-4 py-5">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[var(--cb-primary-soft)] text-xs font-extrabold text-[var(--cb-primary)]">{index + 1}</span>
                <div><h3 className="font-heading text-sm font-bold">{title}</h3><p className="mt-1 text-sm leading-6 text-[var(--cb-text-secondary)]">{copy}</p></div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
