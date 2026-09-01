import { useMemo, useState } from 'react';
import { Ban, BriefcaseBusiness, Check, Search } from 'lucide-react';
import { Badge } from '@/src/components/ui/Badge';
import { Button } from '@/src/components/ui/Button';
import { EmptyState } from '@/src/components/ui/Feedback';
import { Modal, ModalContent } from '@/src/components/ui/Modal';
import { adminJobReviews } from '@/src/data/adminData';
import { useAppStore } from '@/src/store/useAppStore';

export function AdminJobsPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [selectedJob, setSelectedJob] = useState(null);
  const states = useAppStore((state) => state.adminJobStates);
  const setState = useAppStore((state) => state.setAdminJobState);
  const jobs = useMemo(() => adminJobReviews.filter((job) => {
    const current = states[job.id];
    const keyword = search.trim().toLocaleLowerCase();
    return (filter === 'All' || current === filter) && (!keyword || [job.title, job.company, job.reason].join(' ').toLocaleLowerCase().includes(keyword));
  }), [filter, search, states]);

  function deactivateJob() {
    if (!selectedJob) return;
    setState(selectedJob.id, 'Deactivated');
    setSelectedJob(null);
  }

  return (
    <div>
      <header><p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--cb-primary)]">Content safety</p><h1 className="mt-2 font-heading text-3xl font-extrabold tracking-[-0.035em]">Jobs</h1><p className="mt-2 text-sm text-[var(--cb-text-secondary)]">Review reported and expired fictional listings with reversible mock actions.</p></header>
      <section className="surface-card mt-7 flex flex-col gap-3 p-4 sm:flex-row"><label className="flex h-10 flex-1 items-center gap-2 rounded-lg border bg-[var(--cb-surface)] px-3"><Search className="size-4 text-[var(--cb-text-muted)]" /><span className="sr-only">Search moderated jobs</span><input value={search} onChange={(event) => setSearch(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm outline-none" placeholder="Search title, company, or reason" /></label><select aria-label="Filter moderation state" value={filter} onChange={(event) => setFilter(event.target.value)} className="h-10 rounded-lg border bg-[var(--cb-surface)] px-3 text-sm outline-none"><option>All</option><option>Flagged</option><option>Expired</option><option>Cleared</option><option>Deactivated</option></select></section>
      {jobs.length === 0 && <EmptyState className="mt-6" icon={BriefcaseBusiness} title="No jobs found" description="Try another search or moderation state." />}
      {jobs.length > 0 && <div className="surface-card mt-6 overflow-hidden"><div className="hidden grid-cols-[1.25fr_0.9fr_1fr_90px_190px] gap-4 border-b bg-[var(--cb-bg-subtle)] px-5 py-3 text-[10px] font-bold uppercase tracking-wide text-[var(--cb-text-muted)] lg:grid"><span>Listing</span><span>Company</span><span>Reason</span><span>State</span><span>Actions</span></div><div className="divide-y divide-[var(--cb-divider)]">{jobs.map((job) => { const state = states[job.id]; return <article key={job.id} className="grid gap-4 p-5 lg:grid-cols-[1.25fr_0.9fr_1fr_90px_190px] lg:items-center"><div><h2 className="text-sm font-bold">{job.title}</h2><p className="mt-1 text-xs text-[var(--cb-text-muted)]">Reported {new Date(job.reportedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p></div><p className="text-sm text-[var(--cb-text-secondary)]">{job.company}</p><p className="text-xs leading-5 text-[var(--cb-text-secondary)]">{job.reason}</p><Badge variant={state === 'Flagged' || state === 'Deactivated' ? 'danger' : state === 'Cleared' ? 'success' : 'warning'} className="w-fit">{state}</Badge><div className="flex gap-2"><Button size="sm" variant="secondary" onClick={() => setState(job.id, 'Cleared')} disabled={state === 'Cleared'}><Check />Clear</Button><Button size="sm" variant="dangerSoft" onClick={() => setSelectedJob(job)} disabled={state === 'Deactivated'}><Ban />Deactivate</Button></div></article>; })}</div></div>}
      <Modal open={Boolean(selectedJob)} onOpenChange={(open) => !open && setSelectedJob(null)}><ModalContent title="Deactivate this listing?" description="The mock listing will be marked unavailable. This local decision can be changed by clearing the item later."><div className="flex justify-end gap-2"><Button variant="secondary" onClick={() => setSelectedJob(null)}>Cancel</Button><Button variant="danger" onClick={deactivateJob}><Ban />Deactivate job</Button></div></ModalContent></Modal>
    </div>
  );
}
