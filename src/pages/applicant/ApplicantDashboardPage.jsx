import { ArrowRight, Bookmark, BriefcaseBusiness, CalendarCheck, ClipboardCheck, Eye, Sparkles } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { JobCard } from '@/src/components/jobs/JobCard';
import { JobSearchBar } from '@/src/components/jobs/JobSearchBar';
import { Badge } from '@/src/components/ui/Badge';
import { buttonVariants } from '@/src/components/ui/Button';
import { EmptyState, ProgressBar, Skeleton } from '@/src/components/ui/Feedback';
import { dashboardService } from '@/src/services/dashboardService';
import { queryKeys } from '@/src/services/queryKeys';
import { useSavedJobs } from '@/src/features/jobs/useSavedJobs';
import { useDocumentTitle } from '@/src/hooks/useDocumentTitle';

const statusMeta = {
  APPLIED: { label: 'Applied', icon: ClipboardCheck, variant: 'primary' },
  UNDER_REVIEW: { label: 'Under review', icon: Eye, variant: 'info' },
  SHORTLISTED: { label: 'Shortlisted', icon: BriefcaseBusiness, variant: 'warning' },
  INTERVIEW: { label: 'Interviews', icon: CalendarCheck, variant: 'success' },
};

export function ApplicantDashboardPage() {
  useDocumentTitle('Applicant dashboard');
  const dashboardQuery = useQuery({
    queryKey: queryKeys.applicantDashboard(),
    queryFn: ({ signal }) => dashboardService.getApplicantDashboard({ signal }),
  });
  const { savedJobIds, toggleSavedJob } = useSavedJobs();

  if (dashboardQuery.isLoading) return <div className="grid gap-5" aria-label="Loading applicant dashboard"><Skeleton className="h-56" /><Skeleton className="h-80" /><Skeleton className="h-64" /></div>;
  if (dashboardQuery.isError || !dashboardQuery.data) return <EmptyState title="Dashboard could not be loaded" description="Please try again in a moment." actionLabel="Try again" onAction={() => dashboardQuery.refetch()} />;

  const dashboard = dashboardQuery.data;
  const profile = dashboard.profile;
  const recommended = dashboard.recommendedJobs || [];
  const recentApplications = dashboard.recentApplications || [];
  const savedJobs = (dashboard.savedJobs || []).slice(0, 2);

  return (
    <div className="grid gap-8">
      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_330px]">
        <div className="surface-card p-6 sm:p-8">
          <p className="text-sm font-bold text-[var(--cb-primary)]">Welcome back, {dashboard.user.name.split(' ')[0]}</p>
          <h1 className="mt-2 max-w-2xl font-heading text-2xl font-extrabold leading-tight tracking-[-0.035em] sm:text-3xl">Your next opportunity is closer when your profile stays current.</h1>
          <p className="mt-3 text-sm text-[var(--cb-text-secondary)]">Search roles that fit what you know and where you want to grow.</p>
          <div className="mt-6"><JobSearchBar compact /></div>
        </div>
        <aside className="surface-card p-6">
          <div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--cb-primary)]">Profile strength</p><h2 className="mt-1 font-heading text-xl font-extrabold">{profile.profileCompletion}% complete</h2></div><span className="grid size-11 place-items-center rounded-xl bg-[var(--cb-emerald-soft)] text-[var(--cb-emerald)]"><Sparkles /></span></div>
          <ProgressBar className="mt-5" value={profile.profileCompletion} label="Profile completion" />
          <p className="mt-5 text-sm leading-6 text-[var(--cb-text-secondary)]">Add one recent project and its measurable outcome to improve your match context.</p>
          <Link to="/applicant/profile" className={`${buttonVariants({ variant: 'secondary', size: 'md' })} mt-5 w-full`}>Complete profile</Link>
        </aside>
      </section>

      <section aria-labelledby="recommended-title">
        <div className="flex items-end justify-between gap-4"><div><h2 id="recommended-title" className="font-heading text-xl font-extrabold">Recommended for you</h2><p className="mt-1 text-sm text-[var(--cb-text-secondary)]">Based on your skills, preferences, and early-career goals.</p></div><Link to="/jobs" className="hidden items-center gap-2 text-sm font-bold text-[var(--cb-primary)] hover:underline sm:flex">View all <ArrowRight className="size-4" /></Link></div>
        {recommended.length === 0 && <EmptyState className="mt-5" title="No recommendations yet" description="Complete your profile and return when new matching roles are published." />}
        <div className="mt-5 grid gap-4 xl:grid-cols-2">{recommended.map(({ job, match }) => <JobCard key={job.id} job={job} match={match.overallScore} isSaved={savedJobIds.has(job.id)} onSave={toggleSavedJob} />)}</div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <div>
          <h2 className="font-heading text-xl font-extrabold">Application activity</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {Object.entries(statusMeta).map(([status, meta]) => { const Icon = meta.icon; return <div key={status} className="surface-card p-4"><span className="grid size-9 place-items-center rounded-lg bg-[var(--cb-bg-subtle)] text-[var(--cb-primary)]"><Icon className="size-4" /></span><p className="mt-3 font-heading text-2xl font-extrabold">{dashboard.applicationCounts[status] || 0}</p><p className="text-xs font-semibold text-[var(--cb-text-secondary)]">{meta.label}</p></div>; })}
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between"><h2 className="font-heading text-xl font-extrabold">Continue your applications</h2><Link to="/applicant/applications" className="text-sm font-bold text-[var(--cb-primary)] hover:underline">View all</Link></div>
          <div className="surface-card mt-4 divide-y divide-[var(--cb-divider)]">
            {recentApplications.length === 0 && <p className="p-5 text-sm text-[var(--cb-text-muted)]">Your recent applications will appear here.</p>}
            {recentApplications.map((application) => { const { job } = application; const { company } = job; return <Link key={application.id} to={`/applicant/applications/${application.id}`} className="flex items-center gap-3 p-4 hover:bg-[var(--cb-bg-subtle)]"><span className="grid size-10 shrink-0 place-items-center rounded-lg text-xs font-extrabold text-white" style={{ backgroundColor: company.accent }}>{company.initials}</span><span className="min-w-0 flex-1"><strong className="block truncate text-sm">{job.title}</strong><span className="block truncate text-xs text-[var(--cb-text-muted)]">{company.name} · Updated {new Date(application.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span></span><Badge variant={application.statusCode === 'INTERVIEW' || application.statusCode === 'OFFERED' ? 'success' : 'primary'}>{application.status}</Badge></Link>; })}
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="flex items-center justify-between"><h2 className="font-heading text-xl font-extrabold">Saved jobs</h2><Link to="/applicant/saved-jobs" className="text-sm font-bold text-[var(--cb-primary)] hover:underline">See saved roles</Link></div>
          {savedJobs.length === 0 && <p className="mt-4 text-sm text-[var(--cb-text-muted)]">Save promising roles to keep them close.</p>}
          <div className="mt-4 grid gap-4 xl:grid-cols-2">{savedJobs.map((job) => <JobCard key={job.id} job={job} isSaved onSave={toggleSavedJob} />)}</div>
        </div>
        <aside className="surface-card h-fit border-l-4 border-l-[var(--cb-cyan)] p-6">
          <span className="grid size-10 place-items-center rounded-xl bg-[var(--cb-cyan-soft)] text-[var(--cb-cyan-strong)]"><Bookmark /></span><p className="mt-4 text-xs font-bold uppercase tracking-[0.1em] text-[var(--cb-cyan-strong)]">Improve your match</p><h2 className="mt-2 font-heading text-lg font-extrabold">Show how you use API testing</h2><p className="mt-2 text-sm leading-6 text-[var(--cb-text-secondary)]">Several saved engineering roles mention APIs. Add the skill only if a project demonstrates it.</p><Link to="/applicant/profile" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[var(--cb-primary)] hover:underline">Update skills <ArrowRight className="size-4" /></Link>
        </aside>
      </section>
    </div>
  );
}
