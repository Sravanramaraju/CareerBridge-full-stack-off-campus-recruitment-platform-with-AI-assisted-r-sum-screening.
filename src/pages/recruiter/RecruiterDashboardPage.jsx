import { AlertCircle, ArrowRight, BriefcaseBusiness, CalendarCheck, Clock3, FilePlus2, UserCheck, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Avatar } from '@/src/components/ui/Avatar';
import { Badge } from '@/src/components/ui/Badge';
import { buttonVariants } from '@/src/components/ui/Button';
import { getCompanyById, jobs, recruiterCandidates, recruiterJobStats } from '@/src/data/mockData';
import { useAppStore } from '@/src/store/useAppStore';
import { useDocumentTitle } from '@/src/hooks/useDocumentTitle';

const pipelineStages = ['Applied', 'Under Review', 'Shortlisted', 'Interview', 'Offered'];

function candidateStatus(candidate, statuses) { return statuses[candidate.applicationId] || candidate.status; }

export function RecruiterDashboardPage() {
  useDocumentTitle('Recruiter dashboard');
  const statuses = useAppStore((state) => state.candidateStatuses);
  const activeJobs = jobs.filter((job) => recruiterJobStats[job.id]).slice(0, 4);
  const metrics = [
    ['Active jobs', Object.keys(recruiterJobStats).length, BriefcaseBusiness, 'Published roles'],
    ['New applications', recruiterCandidates.filter((item) => ['Applied', 'Under Review'].includes(candidateStatus(item, statuses))).length, UsersRound, 'Need initial review'],
    ['Shortlisted', recruiterCandidates.filter((item) => candidateStatus(item, statuses) === 'Shortlisted').length, UserCheck, 'Across active roles'],
    ['Interviews scheduled', recruiterCandidates.filter((item) => candidateStatus(item, statuses) === 'Interview').length, CalendarCheck, 'Upcoming conversations'],
  ];

  return (
    <div className="grid gap-7">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--cb-primary)]">Hiring workspace</p><h1 className="mt-2 font-heading text-3xl font-extrabold tracking-[-0.035em]">Recruiting overview</h1><p className="mt-2 text-sm text-[var(--cb-text-secondary)]">Track open roles and move promising applicants forward.</p></div><Link to="/recruiter/jobs/new" className={buttonVariants({ variant: 'primary', size: 'lg' })}><FilePlus2 />Post a job</Link></header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Recruiting metrics">
        {metrics.map(([label, value, Icon, helper]) => <article key={label} className="surface-card p-5"><div className="flex items-start justify-between"><div><p className="text-xs font-bold text-[var(--cb-text-muted)]">{label}</p><p className="mt-2 font-heading text-3xl font-extrabold">{value}</p></div><span className="grid size-10 place-items-center rounded-xl bg-[var(--cb-primary-soft)] text-[var(--cb-primary)]"><Icon className="size-5" /></span></div><p className="mt-3 text-xs text-[var(--cb-text-secondary)]">{helper}</p></article>)}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <div>
          <div className="flex items-center justify-between"><div><h2 className="font-heading text-xl font-extrabold">Recent applications</h2><p className="mt-1 text-xs text-[var(--cb-text-muted)]">Latest candidates across your active roles</p></div><Link to="/recruiter/jobs/frontend-engineer-northstar/applicants" className="text-sm font-bold text-[var(--cb-primary)] hover:underline">View pipeline</Link></div>
          <div className="surface-card mt-4 overflow-hidden">
            <div className="hidden grid-cols-[1.1fr_1fr_90px_110px] gap-3 border-b bg-[var(--cb-bg-subtle)] px-5 py-3 text-[10px] font-bold uppercase tracking-wide text-[var(--cb-text-muted)] md:grid"><span>Candidate</span><span>Role</span><span>Match</span><span>Status</span></div>
            <div className="divide-y divide-[var(--cb-divider)]">{recruiterCandidates.slice(0, 5).map((candidate) => { const job = jobs.find((item) => item.id === candidate.jobId); const status = candidateStatus(candidate, statuses); return <Link key={candidate.applicationId} to={`/recruiter/candidates/${candidate.applicationId}`} className="grid gap-3 p-4 hover:bg-[var(--cb-bg-subtle)] md:grid-cols-[1.1fr_1fr_90px_110px] md:items-center md:px-5"><span className="flex min-w-0 items-center gap-3"><Avatar name={candidate.name} size="sm" /><span className="min-w-0"><strong className="block truncate text-sm">{candidate.name}</strong><span className="block truncate text-[10px] text-[var(--cb-text-muted)]">{candidate.location}</span></span></span><span className="truncate text-xs text-[var(--cb-text-secondary)]">{job.title}</span><span className="text-sm font-bold text-[var(--cb-emerald)]">{candidate.match}%</span><Badge variant={status === 'Rejected' ? 'danger' : status === 'Interview' || status === 'Offered' ? 'success' : 'primary'} className="w-fit">{status}</Badge></Link>; })}</div>
          </div>
        </div>

        <div className="grid content-start gap-6">
          <section className="surface-card p-5"><h2 className="font-heading text-lg font-extrabold">Hiring pipeline</h2><div className="mt-5 grid gap-4">{pipelineStages.map((stage) => { const count = recruiterCandidates.filter((candidate) => candidateStatus(candidate, statuses) === stage).length; return <div key={stage}><div className="flex justify-between text-xs"><span className="font-semibold text-[var(--cb-text-secondary)]">{stage}</span><span className="font-bold">{count}</span></div><div className="mt-1.5 h-2 rounded-full bg-[var(--cb-bg-subtle)]"><div className="h-full rounded-full bg-[var(--cb-primary)]" style={{ width: `${Math.max(8, count * 24)}%` }} /></div></div>; })}</div></section>
          <section className="rounded-2xl border border-[var(--cb-amber)] bg-[var(--cb-amber-soft)] p-5"><p className="flex items-center gap-2 text-sm font-bold text-[var(--cb-amber)]"><AlertCircle className="size-4" />Attention required</p><ul className="mt-4 grid gap-3 text-xs leading-5 text-[var(--cb-text-secondary)]"><li>1 saved draft needs role requirements.</li><li>2 roles close within the next two weeks.</li><li>3 applicants are waiting for initial review.</li></ul></section>
        </div>
      </section>

      <section><div className="flex items-end justify-between"><div><h2 className="font-heading text-xl font-extrabold">Active jobs</h2><p className="mt-1 text-xs text-[var(--cb-text-muted)]">Published roles and their current response</p></div><Link to="/recruiter/jobs" className="flex items-center gap-2 text-sm font-bold text-[var(--cb-primary)] hover:underline">Manage jobs <ArrowRight className="size-4" /></Link></div><div className="surface-card mt-4 divide-y divide-[var(--cb-divider)]">{activeJobs.map((job) => { const stats = recruiterJobStats[job.id]; const company = getCompanyById(job.companyId); return <article key={job.id} className="grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_110px_110px_auto] sm:items-center sm:px-5"><div className="min-w-0"><h3 className="truncate text-sm font-bold">{job.title}</h3><p className="mt-1 text-xs text-[var(--cb-text-muted)]">{company.name} · {stats.department}</p></div><span className="flex items-center gap-1.5 text-xs text-[var(--cb-text-secondary)]"><UsersRound className="size-4" />{stats.applications} applicants</span><span className="flex items-center gap-1.5 text-xs text-[var(--cb-text-secondary)]"><Clock3 className="size-4" />{stats.expiresIn} days left</span><Link to={`/recruiter/jobs/${job.id}/applicants`} className="text-xs font-bold text-[var(--cb-primary)] hover:underline">View applicants</Link></article>; })}</div></section>
    </div>
  );
}
