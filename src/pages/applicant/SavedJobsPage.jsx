import { Bookmark, Search } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { JobCard } from '@/src/components/jobs/JobCard';
import { buttonVariants } from '@/src/components/ui/Button';
import { EmptyState } from '@/src/components/ui/Feedback';
import { PageHeader } from '@/src/components/ui/PageHeader';
import { jobs } from '@/src/data/mockData';
import { useAppStore } from '@/src/store/useAppStore';

export function SavedJobsPage() {
  const navigate = useNavigate();
  const [sort, setSort] = useState('recent');
  const [search, setSearch] = useState('');
  const savedJobIds = useAppStore((state) => state.savedJobIds);
  const toggleSavedJob = useAppStore((state) => state.toggleSavedJob);
  const savedJobs = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase();
    const result = jobs.filter((job) => savedJobIds.includes(job.id) && (!keyword || [job.title, job.location, ...job.skills].join(' ').toLocaleLowerCase().includes(keyword)));
    return result.sort((a, b) => sort === 'deadline' ? new Date(a.deadline) - new Date(b.deadline) : new Date(b.postedAt) - new Date(a.postedAt));
  }, [savedJobIds, search, sort]);

  return (
    <div>
      <PageHeader eyebrow="Your shortlist" title="Saved jobs" description={`${savedJobIds.length} role${savedJobIds.length === 1 ? '' : 's'} saved for comparison or a later application.`} />
      {savedJobIds.length > 0 && (
        <div className="mt-7 flex flex-col gap-3 rounded-xl border bg-[var(--cb-surface)] p-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex h-10 flex-1 items-center gap-2 px-2 sm:max-w-md"><Search className="size-4 text-[var(--cb-text-muted)]" /><span className="sr-only">Search saved jobs</span><input className="min-w-0 flex-1 bg-transparent text-sm outline-none" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search your saved roles" /></label>
          <label className="flex items-center gap-2 text-xs font-semibold text-[var(--cb-text-secondary)]">Sort by<select value={sort} onChange={(event) => setSort(event.target.value)} className="h-9 rounded-lg border bg-[var(--cb-surface)] px-3 text-sm outline-none"><option value="recent">Recently posted</option><option value="deadline">Closing soon</option></select></label>
        </div>
      )}
      {savedJobIds.length === 0 && <EmptyState className="mt-8" icon={Bookmark} title="Keep promising roles close" description="Save roles you want to compare or apply to later." actionLabel="Explore jobs" onAction={() => void navigate('/jobs')} />}
      {savedJobIds.length > 0 && savedJobs.length === 0 && <EmptyState className="mt-8" title="No saved roles match that search" description="Try a different title, location, or skill." actionLabel="Clear search" onAction={() => setSearch('')} />}
      {savedJobs.length > 0 && <div className="mt-6 grid gap-4 xl:grid-cols-2">{savedJobs.map((job) => <JobCard key={job.id} job={job} isSaved onSave={toggleSavedJob} />)}</div>}
      {savedJobIds.length > 0 && <Link to="/jobs" className={`${buttonVariants({ variant: 'secondary', size: 'md' })} mt-7`}>Explore more jobs</Link>}
    </div>
  );
}
