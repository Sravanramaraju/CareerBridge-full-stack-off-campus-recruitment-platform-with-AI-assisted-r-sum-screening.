import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileSearch, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ApplicationStatusBadge } from '@/src/components/applications/ApplicationStatusBadge';
import { EmptyState, Skeleton } from '@/src/components/ui/Feedback';
import { PageHeader } from '@/src/components/ui/PageHeader';
import { Tabs } from '@/src/components/ui/Tabs';
import { useDocumentTitle } from '@/src/hooks/useDocumentTitle';
import { applicationsService } from '@/src/services/applicationsService';
import { queryKeys } from '@/src/services/queryKeys';

const tabs = [
  ['All', null], ['Applied', ['Applied']], ['Under review', ['Screening']], ['Shortlisted', ['Assessment']],
  ['Interview', ['Interview']], ['Offered', ['Offer']], ['Rejected', ['Not selected']],
];
const EMPTY_APPLICATIONS = [];

export function ApplicationsPage() {
  useDocumentTitle('My applications');
  const applicationsQuery = useQuery({
    queryKey: queryKeys.applicantApplications(),
    queryFn: ({ signal }) => applicationsService.getApplicantApplications({ signal }),
  });
  const applications = applicationsQuery.data || EMPTY_APPLICATIONS;
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const currentStatuses = tabs.find(([label]) => label === activeTab)?.[1];
  const tabItems = tabs.map(([label, statuses]) => ({
    value: label,
    label,
    count: statuses ? applications.filter((item) => statuses.includes(item.status)).length : applications.length,
  }));

  const filteredApplications = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase();
    return [...applications]
      .filter((application) => !currentStatuses || currentStatuses.includes(application.status))
      .filter((application) => {
        return !keyword || [application.job.title, application.job.company.name]
          .join(' ').toLocaleLowerCase().includes(keyword);
      })
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }, [applications, currentStatuses, search]);

  return (
    <div>
      <PageHeader eyebrow="Your progress" title="My applications" description="Follow each application from submission to final outcome, with the latest update easy to find." />
      <div className="mt-7 flex flex-col gap-4 border-b border-[var(--cb-divider)] pb-4 lg:flex-row lg:items-end lg:justify-between">
        <Tabs items={tabItems} value={activeTab} onValueChange={setActiveTab} label="Application status" />
        <label className="flex h-10 items-center gap-2 rounded-lg border bg-[var(--cb-surface)] px-3 lg:w-72"><Search className="size-4 text-[var(--cb-text-muted)]" /><span className="sr-only">Search applications</span><input value={search} onChange={(event) => setSearch(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm outline-none" placeholder="Search title or company" /></label>
      </div>

      {applicationsQuery.isLoading && <div className="mt-6 grid gap-3" aria-label="Loading applications"><Skeleton className="h-24" /><Skeleton className="h-24" /><Skeleton className="h-24" /></div>}
      {applicationsQuery.isError && <EmptyState className="mt-7" icon={FileSearch} title="Applications could not be loaded" description="Please try again in a moment." actionLabel="Try again" onAction={() => applicationsQuery.refetch()} />}
      {applicationsQuery.isSuccess && filteredApplications.length === 0 && <EmptyState className="mt-7" icon={FileSearch} title="No applications in this view" description="Try another status or search term. New applications will appear here after you apply." />}
      {filteredApplications.length > 0 && (
        <div className="surface-card mt-6 overflow-hidden">
          <div className="hidden grid-cols-[minmax(0,1.4fr)_0.8fr_0.8fr_auto] gap-4 border-b bg-[var(--cb-bg-subtle)] px-5 py-3 text-xs font-bold text-[var(--cb-text-muted)] md:grid"><span>Opportunity</span><span>Applied</span><span>Status</span><span>Action</span></div>
          <div className="divide-y divide-[var(--cb-divider)]">
            {filteredApplications.map((application) => {
              const { job } = application;
              const { company } = job;
              return (
                <article key={application.id} className="grid gap-4 p-5 transition-colors hover:bg-[var(--cb-bg-subtle)] md:grid-cols-[minmax(0,1.4fr)_0.8fr_0.8fr_auto] md:items-center">
                  <div className="flex min-w-0 items-center gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-xl text-xs font-extrabold text-white" style={{ backgroundColor: company.accent }}>{company.initials}</span><span className="min-w-0"><Link to={`/applicant/applications/${application.id}`} className="block truncate text-sm font-bold hover:text-[var(--cb-primary)]">{job.title}</Link><span className="block truncate text-xs text-[var(--cb-text-muted)]">{company.name}</span></span></div>
                  <div><span className="text-[10px] font-bold uppercase text-[var(--cb-text-muted)] md:hidden">Applied </span><span className="text-sm text-[var(--cb-text-secondary)]">{new Date(application.appliedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span></div>
                  <div><ApplicationStatusBadge status={application.status} /><p className="mt-1 text-[10px] text-[var(--cb-text-muted)]">Updated {new Date(application.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p></div>
                  <Link to={`/applicant/applications/${application.id}`} className="text-sm font-bold text-[var(--cb-primary)] hover:underline">View details</Link>
                </article>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
