import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, BadgeCheck, Building2, MapPin, UsersRound } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { JobCard } from '@/src/components/jobs/JobCard';
import { Badge } from '@/src/components/ui/Badge';
import { EmptyState, Skeleton } from '@/src/components/ui/Feedback';
import { companiesService } from '@/src/services/companiesService';
import { jobsService } from '@/src/services/jobsService';
import { queryKeys } from '@/src/services/queryKeys';
import { useAppStore } from '@/src/store/useAppStore';
import { useDocumentTitle } from '@/src/hooks/useDocumentTitle';

const values = [
  ['Learn in the open', 'Questions, early drafts, and thoughtful feedback are part of how work moves forward.'],
  ['Own the outcome', 'Teams stay close to the problem and measure whether their work genuinely helps.'],
  ['Build with care', 'Quality, accessibility, and responsible decisions are expected at every level.'],
];

export function CompanyDetailPage() {
  const { companyId } = useParams();
  const savedJobIds = useAppStore((state) => state.savedJobIds);
  const toggleSavedJob = useAppStore((state) => state.toggleSavedJob);
  const companyQuery = useQuery({ queryKey: queryKeys.company(companyId), queryFn: () => companiesService.getCompanyById(companyId) });
  const jobsQuery = useQuery({ queryKey: queryKeys.companyJobs(companyId), queryFn: () => jobsService.getJobs({}), enabled: companyQuery.isSuccess });
  useDocumentTitle(companyQuery.data?.name || 'Company profile');

  if (companyQuery.isLoading) return <div className="page-container py-12"><Skeleton className="h-5 w-32" /><div className="surface-card mt-7 p-8"><Skeleton className="size-16" /><Skeleton className="mt-5 h-9 w-1/2" /><Skeleton className="mt-3 h-5 w-1/3" /></div></div>;
  if (!companyQuery.data) return <div className="page-container py-16"><EmptyState icon={Building2} title="Company not found" description="This company profile may no longer be available." /></div>;

  const company = companyQuery.data;
  const companyJobs = (jobsQuery.data || []).filter((job) => job.companyId === company.id);

  return (
    <div className="page-container py-8 sm:py-10">
      <Link to="/companies" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--cb-text-secondary)] hover:text-[var(--cb-primary)]"><ArrowLeft className="size-4" />Back to companies</Link>
      <header className="surface-card mt-6 p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <div className="grid size-16 shrink-0 place-items-center rounded-2xl text-lg font-extrabold text-white" style={{ backgroundColor: company.accent }} aria-hidden="true">{company.initials}</div>
          <div>
            <p className="inline-flex items-center gap-1.5 text-sm font-bold text-[var(--cb-emerald)]"><BadgeCheck className="size-4" />Verified employer</p>
            <h1 className="mt-2 font-heading text-3xl font-extrabold tracking-[-0.035em]">{company.name}</h1>
            <p className="mt-2 text-sm text-[var(--cb-text-secondary)]">{company.industry}</p>
          </div>
        </div>
        <div className="mt-7 flex flex-wrap gap-3">
          <Badge className="min-h-8 px-3"><MapPin className="size-3.5" />{company.location}</Badge>
          <Badge className="min-h-8 px-3"><UsersRound className="size-3.5" />{company.size}</Badge>
          <Badge variant="primary" className="min-h-8 px-3">{companyJobs.length} open roles</Badge>
        </div>
      </header>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="grid gap-6">
          <article className="surface-card p-6 sm:p-8">
            <h2 className="font-heading text-xl font-bold">About the company</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--cb-text-secondary)]">{company.description} This fictional company profile demonstrates how CareerBridge gives candidates useful context before they commit time to an application.</p>
          </article>
          <section aria-labelledby="company-jobs-title">
            <h2 id="company-jobs-title" className="font-heading text-xl font-bold">Open opportunities</h2>
            {jobsQuery.isLoading && <div className="mt-4 grid gap-4"><Skeleton className="h-64" /><Skeleton className="h-64" /></div>}
            {jobsQuery.isSuccess && companyJobs.length === 0 && <EmptyState className="mt-4" title="No open roles right now" description="Follow the company and check back when new opportunities are published." />}
            {jobsQuery.isSuccess && companyJobs.length > 0 && <div className="mt-4 grid gap-4">{companyJobs.map((job) => <JobCard key={job.id} job={job} isSaved={savedJobIds.includes(job.id)} onSave={toggleSavedJob} />)}</div>}
          </section>
        </div>
        <aside className="surface-card h-fit p-6 lg:sticky lg:top-24">
          <h2 className="font-heading text-lg font-bold">How this team works</h2>
          <div className="mt-5 grid gap-5">
            {values.map(([title, copy]) => <div key={title}><h3 className="text-sm font-bold">{title}</h3><p className="mt-1 text-xs leading-5 text-[var(--cb-text-secondary)]">{copy}</p></div>)}
          </div>
          <p className="mt-6 border-t border-[var(--cb-divider)] pt-5 text-xs leading-5 text-[var(--cb-text-muted)]">Company information is fictional and created for this portfolio demonstration.</p>
        </aside>
      </div>
    </div>
  );
}
