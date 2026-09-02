import { useMemo, useState } from 'react';
import { Archive, BriefcaseBusiness, Edit3, Eye, FilePlus2, RotateCcw, Search, Trash2, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/src/components/ui/Badge';
import { buttonVariants, Button } from '@/src/components/ui/Button';
import { EmptyState } from '@/src/components/ui/Feedback';
import { Modal, ModalContent } from '@/src/components/ui/Modal';
import { jobs, recruiterJobStats } from '@/src/data/mockData';
import { useAppStore } from '@/src/store/useAppStore';
import { cn } from '@/src/lib/utils';
import { useDocumentTitle } from '@/src/hooks/useDocumentTitle';

const tabs = [['Active', 'Published'], ['Drafts', 'Draft'], ['Closed', 'Closed']];

export function RecruiterJobsPage() {
  useDocumentTitle('Manage jobs');
  const [activeTab, setActiveTab] = useState('Active');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('updated');
  const [department, setDepartment] = useState('');
  const [selectedAction, setSelectedAction] = useState(null);
  const recruiterDrafts = useAppStore((state) => state.recruiterDrafts);
  const recruiterJobStates = useAppStore((state) => state.recruiterJobStates);
  const setRecruiterJobState = useAppStore((state) => state.setRecruiterJobState);
  const deleteRecruiterDraft = useAppStore((state) => state.deleteRecruiterDraft);

  const allJobs = useMemo(() => {
    const combined = new Map();
    jobs.filter((job) => recruiterJobStats[job.id]).forEach((job) => combined.set(job.id, {
      ...job, ...recruiterJobStats[job.id], status: recruiterJobStates[job.id] || 'Published', updatedAt: recruiterJobStats[job.id].publishedAt,
    }));
    recruiterDrafts.forEach((job) => combined.set(job.id, { ...combined.get(job.id), ...job, status: recruiterJobStates[job.id] || job.status || 'Draft', applications: combined.get(job.id)?.applications || 0 }));
    return [...combined.values()];
  }, [recruiterDrafts, recruiterJobStates]);

  const expectedStatus = tabs.find(([label]) => label === activeTab)?.[1];
  const departments = [...new Set(allJobs.map((job) => job.department || 'General'))].sort((a, b) => a.localeCompare(b));
  const visibleJobs = allJobs
    .filter((job) => job.status === expectedStatus
      && job.title.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase())
      && (!department || (job.department || 'General') === department))
    .sort((a, b) => sort === 'applications'
      ? (b.applications || 0) - (a.applications || 0)
      : new Date(b.updatedAt || b.postedAt) - new Date(a.updatedAt || a.postedAt));
  const tabCount = (status) => allJobs.filter((job) => job.status === status).length;

  function confirmAction() {
    if (!selectedAction) return;
    if (selectedAction.type === 'delete') deleteRecruiterDraft(selectedAction.job.id);
    else setRecruiterJobState(selectedAction.job.id, selectedAction.type === 'reopen' ? 'Published' : 'Closed');
    setSelectedAction(null);
  }

  return (
    <div>
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--cb-primary)]">Role management</p><h1 className="mt-2 font-heading text-3xl font-extrabold tracking-[-0.035em]">Jobs</h1><p className="mt-2 text-sm text-[var(--cb-text-secondary)]">Publish clear opportunities and keep each role&apos;s hiring work organised.</p></div><Link to="/recruiter/jobs/new" className={buttonVariants({ variant: 'primary', size: 'lg' })}><FilePlus2 />Post a job</Link></header>

      <div className="mt-7 flex flex-col gap-4 border-b border-[var(--cb-divider)] pb-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex gap-1" role="tablist" aria-label="Job status">{tabs.map(([label, status]) => <button key={label} type="button" role="tab" aria-selected={activeTab === label} onClick={() => setActiveTab(label)} className={cn('rounded-lg px-4 py-2 text-sm font-bold', activeTab === label ? 'bg-[var(--cb-primary-soft)] text-[var(--cb-primary)]' : 'text-[var(--cb-text-secondary)] hover:bg-[var(--cb-bg-subtle)]')}>{label}<span className="ml-2 text-xs opacity-70">{tabCount(status)}</span></button>)}</div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="flex h-10 items-center gap-2 rounded-lg border bg-[var(--cb-surface)] px-3 lg:w-64"><Search className="size-4 text-[var(--cb-text-muted)]" /><span className="sr-only">Search jobs</span><input value={search} onChange={(event) => setSearch(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm outline-none" placeholder="Search job title" /></label>
          <select aria-label="Filter jobs by department" value={department} onChange={(event) => setDepartment(event.target.value)} className="h-10 rounded-lg border bg-[var(--cb-surface)] px-3 text-sm outline-none"><option value="">All departments</option>{departments.map((item) => <option key={item}>{item}</option>)}</select>
          <select aria-label="Sort recruiter jobs" value={sort} onChange={(event) => setSort(event.target.value)} className="h-10 rounded-lg border bg-[var(--cb-surface)] px-3 text-sm outline-none"><option value="updated">Recently updated</option><option value="applications">Most applicants</option></select>
        </div>
      </div>

      {visibleJobs.length === 0 && <EmptyState className="mt-7" icon={BriefcaseBusiness} title={`No ${activeTab.toLocaleLowerCase()} jobs`} description={activeTab === 'Drafts' ? 'Save an unfinished role as a draft and it will appear here.' : 'Roles in this state will appear here.'} />}
      {visibleJobs.length > 0 && (
        <div className="surface-card mt-6 overflow-hidden">
          <div className="hidden grid-cols-[minmax(0,1.5fr)_0.7fr_90px_100px_180px] gap-4 border-b bg-[var(--cb-bg-subtle)] px-5 py-3 text-[10px] font-bold uppercase tracking-wide text-[var(--cb-text-muted)] lg:grid"><span>Role</span><span>Department</span><span>Applicants</span><span>Status</span><span>Actions</span></div>
          <div className="divide-y divide-[var(--cb-divider)]">{visibleJobs.map((job) => (
            <article key={job.id} className="grid gap-4 p-5 lg:grid-cols-[minmax(0,1.5fr)_0.7fr_90px_100px_180px] lg:items-center">
              <div><h2 className="text-sm font-bold">{job.title}</h2><p className="mt-1 text-xs text-[var(--cb-text-muted)]">Updated {new Date(job.updatedAt || job.postedAt || '2026-09-01').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p></div>
              <p className="text-sm text-[var(--cb-text-secondary)]">{job.department || 'General'}</p>
              <p className="flex items-center gap-1.5 text-sm font-semibold"><UsersRound className="size-4 text-[var(--cb-text-muted)]" />{job.applications || 0}</p>
              <Badge variant={job.status === 'Published' ? 'success' : job.status === 'Draft' ? 'warning' : 'neutral'}>{job.status}</Badge>
              <div className="flex items-center gap-1">
                {job.status === 'Published' && <Link to={`/jobs/${job.id}`} className="rounded-lg p-2 text-[var(--cb-text-muted)] hover:bg-[var(--cb-bg-subtle)] hover:text-[var(--cb-primary)]" aria-label={`View ${job.title}`}><Eye className="size-4" /></Link>}
                <Link to={`/recruiter/jobs/${job.id}/edit`} className="rounded-lg p-2 text-[var(--cb-text-muted)] hover:bg-[var(--cb-bg-subtle)] hover:text-[var(--cb-primary)]" aria-label={`Edit ${job.title}`}><Edit3 className="size-4" /></Link>
                {job.status === 'Published' && <Link to={`/recruiter/jobs/${job.id}/applicants`} className="rounded-lg p-2 text-[var(--cb-text-muted)] hover:bg-[var(--cb-bg-subtle)] hover:text-[var(--cb-primary)]" aria-label={`View applicants for ${job.title}`}><UsersRound className="size-4" /></Link>}
                {job.status === 'Published' && <Button variant="ghost" size="iconSm" onClick={() => setSelectedAction({ type: 'close', job })} aria-label={`Close ${job.title}`}><Archive /></Button>}
                {job.status === 'Closed' && <Button variant="ghost" size="iconSm" onClick={() => setSelectedAction({ type: 'reopen', job })} aria-label={`Reopen ${job.title}`}><RotateCcw /></Button>}
                {job.status === 'Draft' && <Button variant="dangerSoft" size="iconSm" onClick={() => setSelectedAction({ type: 'delete', job })} aria-label={`Delete ${job.title}`}><Trash2 /></Button>}
              </div>
            </article>
          ))}</div>
        </div>
      )}

      <Modal open={Boolean(selectedAction)} onOpenChange={(open) => !open && setSelectedAction(null)}><ModalContent title={selectedAction?.type === 'delete' ? 'Delete this draft?' : selectedAction?.type === 'reopen' ? 'Reopen this job?' : 'Close this job?'} description={selectedAction?.type === 'delete' ? 'This locally saved draft will be removed and cannot be recovered.' : selectedAction?.type === 'reopen' ? 'The role will return to the active list and become visible to candidates.' : 'Candidates will no longer see this role as active. Its hiring history will remain available.'}><div className="flex justify-end gap-2"><Button variant="secondary" onClick={() => setSelectedAction(null)}>Cancel</Button><Button variant={selectedAction?.type === 'reopen' ? 'primary' : 'danger'} onClick={confirmAction}>{selectedAction?.type === 'delete' ? <Trash2 /> : selectedAction?.type === 'reopen' ? <RotateCcw /> : <Archive />}{selectedAction?.type === 'delete' ? 'Delete draft' : selectedAction?.type === 'reopen' ? 'Reopen job' : 'Close job'}</Button></div></ModalContent></Modal>
    </div>
  );
}
