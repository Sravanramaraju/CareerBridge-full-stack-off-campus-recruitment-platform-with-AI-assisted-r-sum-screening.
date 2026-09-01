import { AlertTriangle, ArrowRight, BriefcaseBusiness, Building2, ShieldAlert, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/src/components/ui/Badge';
import { adminCompanyReviews, adminJobReviews, adminUsers } from '@/src/data/adminData';
import { useAppStore } from '@/src/store/useAppStore';

export function AdminDashboardPage() {
  const companyStates = useAppStore((state) => state.adminCompanyStates);
  const jobStates = useAppStore((state) => state.adminJobStates);
  const userStates = useAppStore((state) => state.adminUserStates);
  const pendingCompanies = adminCompanyReviews.filter((item) => companyStates[item.id] === 'Pending').length;
  const flaggedJobs = adminJobReviews.filter((item) => jobStates[item.id] === 'Flagged').length;
  const activeUsers = adminUsers.filter((item) => userStates[item.id] === 'Active').length;
  const suspendedUsers = adminUsers.filter((item) => userStates[item.id] === 'Suspended').length;
  const metrics = [
    ['Pending company reviews', pendingCompanies, Building2, '/admin/companies', 'warning'],
    ['Flagged jobs', flaggedJobs, ShieldAlert, '/admin/jobs', 'danger'],
    ['Active demo users', activeUsers, UsersRound, '/admin/users', 'primary'],
    ['Suspended accounts', suspendedUsers, AlertTriangle, '/admin/users', 'neutral'],
  ];

  return (
    <div className="grid gap-7">
      <header><p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--cb-primary)]">Platform health</p><h1 className="mt-2 font-heading text-3xl font-extrabold tracking-[-0.035em]">Admin dashboard</h1><p className="mt-2 text-sm text-[var(--cb-text-secondary)]">Review verification, moderation, and account state across the demo platform.</p></header>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Admin metrics">{metrics.map(([label, value, Icon, to, variant]) => <Link key={label} to={to} className="surface-card group p-5 transition-[border-color,transform] hover:-translate-y-0.5 hover:border-[var(--cb-primary)]"><div className="flex items-start justify-between"><div><p className="text-xs font-bold text-[var(--cb-text-muted)]">{label}</p><p className="mt-2 font-heading text-3xl font-extrabold">{value}</p></div><span className={`grid size-10 place-items-center rounded-xl ${variant === 'danger' ? 'bg-[var(--cb-danger-soft)] text-[var(--cb-danger)]' : variant === 'warning' ? 'bg-[var(--cb-amber-soft)] text-[var(--cb-amber)]' : 'bg-[var(--cb-primary-soft)] text-[var(--cb-primary)]'}`}><Icon className="size-5" /></span></div><p className="mt-4 flex items-center gap-1 text-xs font-bold text-[var(--cb-primary)]">Open queue <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" /></p></Link>)}</section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div><div className="flex items-end justify-between"><div><h2 className="font-heading text-xl font-extrabold">Company review queue</h2><p className="mt-1 text-xs text-[var(--cb-text-muted)]">Profiles awaiting a mock verification decision</p></div><Link to="/admin/companies" className="text-xs font-bold text-[var(--cb-primary)] hover:underline">View all</Link></div><div className="surface-card mt-4 divide-y divide-[var(--cb-divider)]">{adminCompanyReviews.filter((item) => companyStates[item.id] !== 'Verified').slice(0, 4).map((company) => <article key={company.id} className="flex items-center gap-3 p-4"><span className="grid size-10 shrink-0 place-items-center rounded-lg bg-[var(--cb-primary-soft)] font-heading text-xs font-extrabold text-[var(--cb-primary)]">{company.name.split(' ').map((word) => word[0]).join('').slice(0, 2)}</span><div className="min-w-0 flex-1"><h3 className="truncate text-sm font-bold">{company.name}</h3><p className="mt-1 truncate text-xs text-[var(--cb-text-muted)]">{company.industry}</p></div><Badge variant={companyStates[company.id] === 'Needs changes' ? 'danger' : 'warning'}>{companyStates[company.id]}</Badge></article>)}</div></div>
        <div><div className="flex items-end justify-between"><div><h2 className="font-heading text-xl font-extrabold">Job moderation queue</h2><p className="mt-1 text-xs text-[var(--cb-text-muted)]">Reported and expired demo listings</p></div><Link to="/admin/jobs" className="text-xs font-bold text-[var(--cb-primary)] hover:underline">View all</Link></div><div className="surface-card mt-4 divide-y divide-[var(--cb-divider)]">{adminJobReviews.filter((item) => !['Cleared', 'Deactivated'].includes(jobStates[item.id])).slice(0, 4).map((job) => <article key={job.id} className="flex items-center gap-3 p-4"><span className="grid size-10 shrink-0 place-items-center rounded-lg bg-[var(--cb-danger-soft)] text-[var(--cb-danger)]"><BriefcaseBusiness className="size-4" /></span><div className="min-w-0 flex-1"><h3 className="truncate text-sm font-bold">{job.title}</h3><p className="mt-1 truncate text-xs text-[var(--cb-text-muted)]">{job.company} · {job.reason}</p></div><Badge variant={jobStates[job.id] === 'Flagged' ? 'danger' : 'warning'}>{jobStates[job.id]}</Badge></article>)}</div></div>
      </section>
      <p className="text-xs leading-5 text-[var(--cb-text-muted)]">All counts and decisions in this admin area are fictional, device-local portfolio data.</p>
    </div>
  );
}
