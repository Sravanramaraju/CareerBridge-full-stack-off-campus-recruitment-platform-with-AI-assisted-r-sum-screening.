import {
  AlertCircle, ArrowRight, BriefcaseBusiness, CalendarCheck, Clock3, FilePlus2,
  UserCheck, UsersRound,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Avatar } from '@/src/components/ui/Avatar';
import { Badge } from '@/src/components/ui/Badge';
import { buttonVariants } from '@/src/components/ui/Button';
import { EmptyState, Skeleton } from '@/src/components/ui/Feedback';
import { useDocumentTitle } from '@/src/hooks/useDocumentTitle';
import { dashboardService } from '@/src/services/dashboardService';
import { queryKeys } from '@/src/services/queryKeys';

const pipelineStages = [
  ['APPLIED', 'Applied'], ['UNDER_REVIEW', 'Under Review'], ['SHORTLISTED', 'Shortlisted'],
  ['INTERVIEW', 'Interview'], ['OFFERED', 'Offered'],
];

function statusVariant(status) {
  if (status === 'Rejected' || status === 'Withdrawn') return 'danger';
  if (status === 'Interview' || status === 'Offered') return 'success';
  return status === 'Shortlisted' ? 'primary' : 'neutral';
}

function daysUntil(value) {
  if (!value) return null;
  return Math.max(0, Math.ceil((new Date(value).getTime() - Date.now()) / 86_400_000));
}

export function RecruiterDashboardPage() {
  useDocumentTitle('Recruiter dashboard');
  const dashboardQuery = useQuery({
    queryKey: queryKeys.recruiterDashboard(),
    queryFn: ({ signal }) => dashboardService.getRecruiterDashboard({ signal }),
  });

  if (dashboardQuery.isLoading) {
    return <div aria-label="Loading recruiter dashboard" className="grid gap-6"><Skeleton className="h-24" /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-32" />)}</div><Skeleton className="h-96" /></div>;
  }
  if (dashboardQuery.isError || !dashboardQuery.data) {
    return <EmptyState title="Recruiting overview could not be loaded" description="Your hiring workspace is temporarily unavailable." actionLabel="Try again" onAction={() => dashboardQuery.refetch()} />;
  }

  const dashboard = dashboardQuery.data;
  const metrics = [
    ['Active jobs', dashboard.metrics.activeJobs, BriefcaseBusiness, 'Published roles'],
    ['New applications', dashboard.metrics.newApplications, UsersRound, 'Need initial review'],
    ['Shortlisted', dashboard.metrics.shortlisted, UserCheck, 'Across your roles'],
    ['Interviews', dashboard.metrics.interviews, CalendarCheck, 'Candidates in interview'],
  ];
  const highestStageCount = Math.max(1, ...pipelineStages.map(([status]) => dashboard.stageDistribution[status] || 0));
  const pipelineJobId = dashboard.recentCandidates[0]?.jobId || dashboard.activeJobs[0]?.id;
  const attentionItems = [
    dashboard.attention.draftJobs > 0 && `${dashboard.attention.draftJobs} draft ${dashboard.attention.draftJobs === 1 ? 'role needs' : 'roles need'} completion.`,
    dashboard.attention.closingSoon > 0 && `${dashboard.attention.closingSoon} ${dashboard.attention.closingSoon === 1 ? 'role closes' : 'roles close'} within the next two weeks.`,
    dashboard.attention.awaitingInitialReview > 0 && `${dashboard.attention.awaitingInitialReview} ${dashboard.attention.awaitingInitialReview === 1 ? 'applicant is' : 'applicants are'} waiting for initial review.`,
  ].filter(Boolean);

  return (
    <div className="grid gap-7">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--cb-primary)]">{dashboard.company.name}</p><h1 className="mt-2 font-heading text-3xl font-extrabold tracking-[-0.035em]">Recruiting overview</h1><p className="mt-2 text-sm text-[var(--cb-text-secondary)]">Track open roles and move promising applicants forward.</p></div><Link to="/recruiter/jobs/new" className={buttonVariants({ variant: 'primary', size: 'lg' })}><FilePlus2 />Post a job</Link></header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Recruiting metrics">
        {metrics.map(([label, value, Icon, helper]) => <article key={label} className="surface-card p-5"><div className="flex items-start justify-between"><div><p className="text-xs font-bold text-[var(--cb-text-muted)]">{label}</p><p className="mt-2 font-heading text-3xl font-extrabold">{value}</p></div><span className="grid size-10 place-items-center rounded-xl bg-[var(--cb-primary-soft)] text-[var(--cb-primary)]"><Icon className="size-5" /></span></div><p className="mt-3 text-xs text-[var(--cb-text-secondary)]">{helper}</p></article>)}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <div>
          <div className="flex items-center justify-between"><div><h2 className="font-heading text-xl font-extrabold">Recent applications</h2><p className="mt-1 text-xs text-[var(--cb-text-muted)]">Latest candidates across your roles</p></div>{pipelineJobId && <Link to={`/recruiter/jobs/${pipelineJobId}/applicants`} className="text-sm font-bold text-[var(--cb-primary)] hover:underline">View pipeline</Link>}</div>
          {dashboard.recentCandidates.length === 0 ? <EmptyState className="mt-4" title="No applications yet" description="New candidates will appear here after they apply to one of your published roles." /> : <div className="surface-card mt-4 overflow-hidden"><div className="hidden grid-cols-[1.1fr_1fr_90px_110px] gap-3 border-b bg-[var(--cb-bg-subtle)] px-5 py-3 text-[10px] font-bold uppercase tracking-wide text-[var(--cb-text-muted)] md:grid"><span>Candidate</span><span>Role</span><span>Match</span><span>Status</span></div><div className="divide-y divide-[var(--cb-divider)]">{dashboard.recentCandidates.map((candidate) => <Link key={candidate.applicationId} to={`/recruiter/candidates/${candidate.applicationId}`} className="grid gap-3 p-4 hover:bg-[var(--cb-bg-subtle)] md:grid-cols-[1.1fr_1fr_90px_110px] md:items-center md:px-5"><span className="flex min-w-0 items-center gap-3"><Avatar name={candidate.name} size="sm" /><span className="min-w-0"><strong className="block truncate text-sm">{candidate.name}</strong><span className="block truncate text-[10px] text-[var(--cb-text-muted)]">{candidate.location}</span></span></span><span className="truncate text-xs text-[var(--cb-text-secondary)]">{candidate.job.title}</span><span className="text-sm font-bold text-[var(--cb-emerald)]">{Number.isFinite(candidate.match) ? `${candidate.match}%` : 'Pending'}</span><Badge variant={statusVariant(candidate.status)} className="w-fit">{candidate.status}</Badge></Link>)}</div></div>}
        </div>

        <div className="grid content-start gap-6">
          <section className="surface-card p-5"><h2 className="font-heading text-lg font-extrabold">Hiring pipeline</h2><div className="mt-5 grid gap-4">{pipelineStages.map(([status, label]) => { const count = dashboard.stageDistribution[status] || 0; return <div key={status}><div className="flex justify-between text-xs"><span className="font-semibold text-[var(--cb-text-secondary)]">{label}</span><span className="font-bold">{count}</span></div><div className="mt-1.5 h-2 rounded-full bg-[var(--cb-bg-subtle)]"><div className="h-full rounded-full bg-[var(--cb-primary)]" style={{ width: count === 0 ? '0%' : `${Math.max(8, (count / highestStageCount) * 100)}%` }} /></div></div>; })}</div></section>
          <section className="rounded-2xl border border-[var(--cb-amber)] bg-[var(--cb-amber-soft)] p-5"><p className="flex items-center gap-2 text-sm font-bold text-[var(--cb-amber)]"><AlertCircle className="size-4" />Attention required</p>{attentionItems.length ? <ul className="mt-4 grid gap-3 text-xs leading-5 text-[var(--cb-text-secondary)]">{attentionItems.map((item) => <li key={item}>{item}</li>)}</ul> : <p className="mt-4 text-xs leading-5 text-[var(--cb-text-secondary)]">There are no urgent hiring tasks right now.</p>}</section>
        </div>
      </section>

      <section><div className="flex items-end justify-between"><div><h2 className="font-heading text-xl font-extrabold">Active jobs</h2><p className="mt-1 text-xs text-[var(--cb-text-muted)]">Published roles and their current response</p></div><Link to="/recruiter/jobs" className="flex items-center gap-2 text-sm font-bold text-[var(--cb-primary)] hover:underline">Manage jobs <ArrowRight className="size-4" /></Link></div>{dashboard.activeJobs.length === 0 ? <EmptyState className="mt-4" title="No active jobs" description="Publish a role to start receiving applications." /> : <div className="surface-card mt-4 divide-y divide-[var(--cb-divider)]">{dashboard.activeJobs.map((job) => { const remainingDays = daysUntil(job.deadline); return <article key={job.id} className="grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_110px_110px_auto] sm:items-center sm:px-5"><div className="min-w-0"><h3 className="truncate text-sm font-bold">{job.title}</h3><p className="mt-1 text-xs text-[var(--cb-text-muted)]">{dashboard.company.name}{job.department ? ` · ${job.department}` : ''}</p></div><span className="flex items-center gap-1.5 text-xs text-[var(--cb-text-secondary)]"><UsersRound className="size-4" />{job.applicationCount} applicants</span><span className="flex items-center gap-1.5 text-xs text-[var(--cb-text-secondary)]"><Clock3 className="size-4" />{remainingDays === null ? 'No deadline' : `${remainingDays} days left`}</span><Link to={`/recruiter/jobs/${job.id}/applicants`} className="text-xs font-bold text-[var(--cb-primary)] hover:underline">View applicants</Link></article>; })}</div>}</section>
    </div>
  );
}
