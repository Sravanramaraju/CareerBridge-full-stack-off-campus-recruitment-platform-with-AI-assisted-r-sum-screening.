import { ArrowLeft, Clock3, FileText, Mail } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { ApplicationStatusBadge } from '@/src/components/applications/ApplicationStatusBadge';
import { ApplicationTimeline } from '@/src/components/applications/ApplicationTimeline';
import { buttonVariants } from '@/src/components/ui/Button';
import { EmptyState } from '@/src/components/ui/Feedback';
import { getCompanyById, jobs } from '@/src/data/mockData';
import { useAppStore } from '@/src/store/useAppStore';

export function ApplicationDetailPage() {
  const { applicationId } = useParams();
  const application = useAppStore((state) => state.applications.find((item) => item.id === applicationId));
  if (!application) return <div><EmptyState title="Application not found" description="This application may have been removed from local demo storage." /><Link to="/applicant/applications" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[var(--cb-primary)]"><ArrowLeft className="size-4" />Back to applications</Link></div>;

  const job = jobs.find((item) => item.id === application.jobId);
  const company = getCompanyById(job.companyId);

  return (
    <div>
      <Link to="/applicant/applications" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--cb-text-secondary)] hover:text-[var(--cb-primary)]"><ArrowLeft className="size-4" />Back to applications</Link>
      <header className="surface-card mt-5 p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-4"><span className="grid size-14 shrink-0 place-items-center rounded-2xl text-sm font-extrabold text-white" style={{ backgroundColor: company.accent }}>{company.initials}</span><div><p className="text-sm font-semibold text-[var(--cb-text-secondary)]">{company.name}</p><h1 className="mt-1 font-heading text-2xl font-extrabold tracking-[-0.03em]">{job.title}</h1><p className="mt-2 text-xs text-[var(--cb-text-muted)]">Application ID {application.id}</p></div></div>
          <ApplicationStatusBadge status={application.status} className="w-fit" />
        </div>
      </header>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="grid gap-6">
          <section className="surface-card p-6 sm:p-8" aria-labelledby="timeline-title">
            <h2 id="timeline-title" className="font-heading text-xl font-bold">Application timeline</h2>
            <ApplicationTimeline application={application} />
          </section>

          <section className="surface-card p-6 sm:p-8">
            <h2 className="font-heading text-xl font-bold">Recruiter updates</h2>
            <div className="mt-5 grid gap-4">{application.timeline.slice(1).reverse().map((event) => <article key={`${event.status}-${event.date}`} className="flex gap-3 rounded-xl bg-[var(--cb-bg-subtle)] p-4"><Mail className="mt-0.5 size-4 shrink-0 text-[var(--cb-primary)]" /><div><h3 className="text-sm font-bold">{event.status} update</h3><p className="mt-1 text-xs leading-5 text-[var(--cb-text-secondary)]">{event.note}</p></div></article>)}</div>
            {application.timeline.length === 1 && <p className="mt-4 text-sm text-[var(--cb-text-muted)]">No recruiter updates yet. The hiring team will post progress here.</p>}
          </section>
        </div>

        <aside className="grid h-fit gap-5 lg:sticky lg:top-24">
          <section className="surface-card p-6"><h2 className="font-heading text-lg font-bold">Application snapshot</h2><dl className="mt-4 grid gap-3 text-sm"><div className="flex justify-between gap-3"><dt className="text-[var(--cb-text-muted)]">Applied</dt><dd className="font-semibold">{new Date(application.appliedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</dd></div><div className="flex justify-between gap-3"><dt className="text-[var(--cb-text-muted)]">Work mode</dt><dd className="font-semibold">{job.workMode}</dd></div><div className="flex justify-between gap-3"><dt className="text-[var(--cb-text-muted)]">Location</dt><dd className="text-right font-semibold">{job.location}</dd></div></dl><Link to={`/jobs/${job.id}`} className={`${buttonVariants({ variant: 'secondary', size: 'md' })} mt-5 w-full`}>View job</Link></section>
          <section className="surface-card p-6"><p className="flex items-center gap-2 text-sm font-bold"><FileText className="size-4 text-[var(--cb-primary)]" />Submitted resume</p><p className="mt-3 text-sm font-semibold">Ananya_Rao_Resume.pdf</p><p className="mt-1 text-xs text-[var(--cb-text-muted)]">Demo document · 242 KB</p>{application.coverNote && <><p className="mt-5 border-t border-[var(--cb-divider)] pt-5 text-sm font-bold">Cover note</p><p className="mt-2 text-xs leading-5 text-[var(--cb-text-secondary)]">{application.coverNote}</p></>}</section>
          <p className="flex gap-2 text-xs leading-5 text-[var(--cb-text-muted)]"><Clock3 className="mt-0.5 size-4 shrink-0" />Status changes are mock data saved on this device for the portfolio demonstration.</p>
        </aside>
      </div>
    </div>
  );
}
