import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Ban, BriefcaseBusiness, Check, Flag, Search } from 'lucide-react';
import { Badge } from '@/src/components/ui/Badge';
import { Button } from '@/src/components/ui/Button';
import { EmptyState, Skeleton } from '@/src/components/ui/Feedback';
import { TextArea } from '@/src/components/ui/Input';
import { Modal, ModalContent } from '@/src/components/ui/Modal';
import { Pagination } from '@/src/components/ui/Pagination';
import { useToast } from '@/src/components/feedback/ToastProvider';
import { useDocumentTitle } from '@/src/hooks/useDocumentTitle';
import { adminService } from '@/src/services/adminService';
import { queryKeys } from '@/src/services/queryKeys';

const moderationOptions = [
  ['', 'All moderation states'], ['PENDING', 'Pending'], ['CLEARED', 'Cleared'],
  ['FLAGGED', 'Flagged'], ['DEACTIVATED', 'Deactivated'],
];
const lifecycleOptions = [
  ['', 'All lifecycle states'], ['DRAFT', 'Draft'], ['PUBLISHED', 'Published'],
  ['CLOSED', 'Closed'], ['ARCHIVED', 'Archived'],
];

function moderationVariant(status) {
  if (status === 'FLAGGED' || status === 'DEACTIVATED') return 'danger';
  if (status === 'CLEARED') return 'success';
  return 'warning';
}

export function AdminJobsPage() {
  useDocumentTitle('Job moderation');
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [moderationStatus, setModerationStatus] = useState('');
  const [jobStatus, setJobStatus] = useState('');
  const [page, setPage] = useState(1);
  const [decision, setDecision] = useState(null);
  const [reason, setReason] = useState('');
  const filters = useMemo(() => ({
    q: search.trim() || undefined,
    moderationStatus: moderationStatus || undefined,
    status: jobStatus || undefined,
    page,
    pageSize: 20,
  }), [jobStatus, moderationStatus, page, search]);
  const jobsQuery = useQuery({
    queryKey: queryKeys.adminJobs(filters),
    queryFn: ({ signal }) => adminService.getJobs(filters, { signal }),
  });
  const moderationMutation = useMutation({
    mutationFn: ({ job, action, decisionReason }) => adminService.updateJobModeration(job.id, action, decisionReason),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.adminJobs(filters), (current) => current ? {
        ...current, items: current.items.map((job) => job.id === updated.id ? updated : job),
      } : current);
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminDashboard() });
      setDecision(null);
      setReason('');
      showToast(`${updated.title} is now ${updated.moderationLabel.toLowerCase()}.`);
    },
    onError: (error) => showToast(error instanceof Error ? error.message : 'Unable to update job moderation.', { tone: 'error' }),
  });
  const jobs = jobsQuery.data?.items || [];
  const pagination = jobsQuery.data?.pagination;

  function updateFilter(setter, value) { setter(value); setPage(1); }
  function submitDecision() {
    if (!decision || reason.trim().length < 3) return;
    moderationMutation.mutate({ job: decision.job, action: decision.action, decisionReason: reason });
  }

  return (
    <div>
      <header><p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--cb-primary)]">Content safety</p><h1 className="mt-2 font-heading text-3xl font-extrabold tracking-[-0.035em]">Jobs</h1><p className="mt-2 text-sm text-[var(--cb-text-secondary)]">Review job listings and record audited moderation decisions.</p></header>
      <section className="surface-card mt-7 grid gap-3 p-4 md:grid-cols-[1fr_190px_180px]" aria-label="Job moderation filters"><label className="flex h-10 items-center gap-2 rounded-lg border bg-[var(--cb-surface)] px-3"><Search className="size-4 text-[var(--cb-text-muted)]" /><span className="sr-only">Search moderated jobs</span><input value={search} onChange={(event) => updateFilter(setSearch, event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm outline-none" placeholder="Search title or company" /></label><select aria-label="Filter moderation state" value={moderationStatus} onChange={(event) => updateFilter(setModerationStatus, event.target.value)} className="h-10 rounded-lg border bg-[var(--cb-surface)] px-3 text-sm outline-none">{moderationOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><select aria-label="Filter job lifecycle" value={jobStatus} onChange={(event) => updateFilter(setJobStatus, event.target.value)} className="h-10 rounded-lg border bg-[var(--cb-surface)] px-3 text-sm outline-none">{lifecycleOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></section>
      {jobsQuery.isLoading && <div className="mt-6 grid gap-3">{Array.from({ length: 5 }, (_, index) => <Skeleton key={index} className="h-24" />)}</div>}
      {jobsQuery.isError && <EmptyState className="mt-6" icon={BriefcaseBusiness} title="Job moderation queue could not be loaded" description="Please try again in a moment." actionLabel="Try again" onAction={() => jobsQuery.refetch()} />}
      {jobsQuery.isSuccess && jobs.length === 0 && <EmptyState className="mt-6" icon={BriefcaseBusiness} title="No jobs found" description="Try another search, lifecycle state, or moderation status." />}
      {jobs.length > 0 && <div className="surface-card mt-6 overflow-hidden"><div className="hidden grid-cols-[1.25fr_0.9fr_0.7fr_100px_260px] gap-4 border-b bg-[var(--cb-bg-subtle)] px-5 py-3 text-[10px] font-bold uppercase tracking-wide text-[var(--cb-text-muted)] lg:grid"><span>Listing</span><span>Company</span><span>Response</span><span>State</span><span>Actions</span></div><div className="divide-y divide-[var(--cb-divider)]">{jobs.map((job) => <article key={job.id} className="grid gap-4 p-5 lg:grid-cols-[1.25fr_0.9fr_0.7fr_100px_260px] lg:items-center"><div><h2 className="text-sm font-bold">{job.title}</h2><p className="mt-1 text-xs text-[var(--cb-text-muted)]">{job.statusLabel} · {job.location || 'Location not provided'}</p></div><p className="text-sm text-[var(--cb-text-secondary)]">{job.company.name}</p><p className="text-xs leading-5 text-[var(--cb-text-secondary)]">{job.applicationCount} applications · {job.savedCount} saves</p><Badge variant={moderationVariant(job.moderationStatus)} className="w-fit">{job.moderationLabel}</Badge><div className="flex flex-wrap gap-2"><Button size="sm" variant="secondary" disabled={moderationMutation.isPending || job.moderationStatus === 'CLEARED'} onClick={() => moderationMutation.mutate({ job, action: 'CLEAR' })}><Check />Clear</Button><Button size="sm" variant="dangerSoft" disabled={moderationMutation.isPending || job.moderationStatus === 'FLAGGED'} onClick={() => setDecision({ job, action: 'FLAG' })}><Flag />Flag</Button><Button size="sm" variant="danger" disabled={moderationMutation.isPending || job.moderationStatus === 'DEACTIVATED'} onClick={() => setDecision({ job, action: 'DEACTIVATE' })}><Ban />Deactivate</Button></div></article>)}</div></div>}
      {pagination && <Pagination currentPage={pagination.page} pageCount={pagination.totalPages} onPageChange={setPage} />}

      <Modal open={Boolean(decision)} onOpenChange={(open) => { if (!open) { setDecision(null); setReason(''); } }}><ModalContent title={decision?.action === 'DEACTIVATE' ? `Deactivate ${decision.job.title}?` : `Flag ${decision?.job.title || 'this listing'}?`} description="Provide a job-relevant reason. Recruiters will be notified and the decision will be recorded in the audit log."><TextArea value={reason} onChange={(event) => setReason(event.target.value)} minLength={3} maxLength={500} aria-label="Job moderation reason" placeholder="Explain the policy or content issue…" /><div className="mt-4 flex justify-end gap-2"><Button variant="secondary" onClick={() => { setDecision(null); setReason(''); }}>Cancel</Button><Button variant="danger" disabled={reason.trim().length < 3 || moderationMutation.isPending} onClick={submitDecision}>{moderationMutation.isPending ? 'Saving…' : 'Confirm decision'}</Button></div></ModalContent></Modal>
    </div>
  );
}
