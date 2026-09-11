import {
  ArrowRight, BriefcaseBusiness, Building2, ClipboardCheck, FileText, ShieldAlert,
  UserCheck, UsersRound,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Badge } from '@/src/components/ui/Badge';
import { EmptyState, Skeleton } from '@/src/components/ui/Feedback';
import { useDocumentTitle } from '@/src/hooks/useDocumentTitle';
import { adminService } from '@/src/services/adminService';
import { queryKeys } from '@/src/services/queryKeys';

const actionLabels = Object.freeze({
  COMPANY_VERIFICATION_CHANGED: 'Company verification changed',
  JOB_MODERATION_CHANGED: 'Job moderation changed',
  USER_STATUS_CHANGED: 'User account status changed',
});

function readableDate(value) {
  return new Date(value).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit',
  });
}

export function AdminDashboardPage() {
  useDocumentTitle('Admin dashboard');
  const dashboardQuery = useQuery({
    queryKey: queryKeys.adminDashboard(),
    queryFn: ({ signal }) => adminService.getDashboard({ signal }),
  });

  if (dashboardQuery.isLoading) {
    return <div aria-label="Loading admin dashboard" className="grid gap-6"><Skeleton className="h-24" /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-32" />)}</div><Skeleton className="h-80" /></div>;
  }
  if (dashboardQuery.isError || !dashboardQuery.data) {
    return <EmptyState title="Admin dashboard could not be loaded" description="Platform metrics are temporarily unavailable." actionLabel="Try again" onAction={() => dashboardQuery.refetch()} />;
  }

  const { metrics, recentModeration } = dashboardQuery.data;
  const queueMetrics = [
    ['Pending company reviews', metrics.pendingCompanies, Building2, '/admin/companies', 'warning'],
    ['Flagged jobs', metrics.flaggedJobs, ShieldAlert, '/admin/jobs', 'danger'],
    ['Total users', metrics.totalUsers, UsersRound, '/admin/users', 'primary'],
    ['Applications', metrics.applications, ClipboardCheck, '/admin/users', 'primary'],
  ];
  const platformMetrics = [
    ['Active applicants', metrics.activeApplicants, UserCheck],
    ['Recruiters', metrics.recruiters, UsersRound],
    ['Published jobs', metrics.publishedJobs, BriefcaseBusiness],
  ];

  return (
    <div className="grid gap-7">
      <header><p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--cb-primary)]">Platform health</p><h1 className="mt-2 font-heading text-3xl font-extrabold tracking-[-0.035em]">Admin dashboard</h1><p className="mt-2 text-sm text-[var(--cb-text-secondary)]">Review verification, moderation, and account activity across CareerBridge.</p></header>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Admin metrics">{queueMetrics.map(([label, value, Icon, to, variant]) => <Link key={label} to={to} className="surface-card group p-5 transition-[border-color,transform] hover:-translate-y-0.5 hover:border-[var(--cb-primary)]"><div className="flex items-start justify-between"><div><p className="text-xs font-bold text-[var(--cb-text-muted)]">{label}</p><p className="mt-2 font-heading text-3xl font-extrabold">{value}</p></div><span className={`grid size-10 place-items-center rounded-xl ${variant === 'danger' ? 'bg-[var(--cb-danger-soft)] text-[var(--cb-danger)]' : variant === 'warning' ? 'bg-[var(--cb-amber-soft)] text-[var(--cb-amber)]' : 'bg-[var(--cb-primary-soft)] text-[var(--cb-primary)]'}`}><Icon className="size-5" /></span></div><p className="mt-4 flex items-center gap-1 text-xs font-bold text-[var(--cb-primary)]">Open queue <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" /></p></Link>)}</section>

      <section className="grid gap-4 sm:grid-cols-3" aria-label="Platform totals">{platformMetrics.map(([label, value, Icon]) => <article key={label} className="surface-card flex items-center gap-4 p-5"><span className="grid size-10 place-items-center rounded-xl bg-[var(--cb-bg-subtle)] text-[var(--cb-text-secondary)]"><Icon className="size-5" /></span><div><p className="text-xs font-semibold text-[var(--cb-text-muted)]">{label}</p><p className="mt-1 font-heading text-xl font-extrabold">{value}</p></div></article>)}</section>

      <section><div className="flex items-end justify-between"><div><h2 className="font-heading text-xl font-extrabold">Recent moderation work</h2><p className="mt-1 text-xs text-[var(--cb-text-muted)]">Latest audited administrator decisions</p></div></div>{recentModeration.length === 0 ? <EmptyState className="mt-4" icon={FileText} title="No moderation activity yet" description="Company, job, and user decisions will appear here." /> : <div className="surface-card mt-4 divide-y divide-[var(--cb-divider)]">{recentModeration.map((activity) => <article key={activity.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:px-5"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--cb-primary-soft)] text-[var(--cb-primary)]"><FileText className="size-4" /></span><div className="min-w-0 flex-1"><h3 className="text-sm font-bold">{actionLabels[activity.action] || activity.action}</h3><p className="mt-1 truncate text-xs text-[var(--cb-text-muted)]">{activity.actor?.name || activity.actor?.email || 'Administrator'} · {readableDate(activity.createdAt)}</p></div><Badge variant={activity.metadata?.to === 'FLAGGED' || activity.metadata?.to === 'SUSPENDED' || activity.metadata?.to === 'REJECTED' ? 'danger' : 'neutral'}>{activity.metadata?.from || 'New'} → {activity.metadata?.to || 'Updated'}</Badge></article>)}</div>}</section>
    </div>
  );
}
