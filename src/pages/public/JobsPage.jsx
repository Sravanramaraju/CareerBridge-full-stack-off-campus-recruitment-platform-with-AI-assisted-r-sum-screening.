import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BriefcaseBusiness, SlidersHorizontal, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { JobCard } from '@/src/components/jobs/JobCard';
import { JobSearchBar } from '@/src/components/jobs/JobSearchBar';
import { Button } from '@/src/components/ui/Button';
import { EmptyState, Skeleton } from '@/src/components/ui/Feedback';
import { EMPLOYMENT_TYPES, WORK_MODES } from '@/src/domain/constants';
import { catalogService } from '@/src/services/mockApi';
import { useAppStore } from '@/src/store/useAppStore';

function FilterGroup({ title, options, selected, onChange }) {
  return (
    <fieldset className="border-b border-[var(--cb-divider)] pb-6 last:border-0">
      <legend className="font-heading text-sm font-bold">{title}</legend>
      <div className="mt-3 grid gap-2.5">
        {options.map((option) => (
          <label key={option} className="flex cursor-pointer items-center gap-2.5 text-sm text-[var(--cb-text-secondary)]">
            <input
              type="checkbox"
              className="size-4 rounded border-[var(--cb-border-strong)] accent-[var(--cb-primary)]"
              checked={selected.includes(option)}
              onChange={() => onChange(option)}
            />
            {option}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function JobsLoading() {
  return (
    <div className="grid gap-4 lg:grid-cols-2" aria-label="Loading jobs">
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} className="surface-card p-6">
          <div className="flex gap-4"><Skeleton className="size-12" /><div className="flex-1"><Skeleton className="h-5 w-2/3" /><Skeleton className="mt-2 h-4 w-1/3" /></div></div>
          <Skeleton className="mt-6 h-4 w-full" /><Skeleton className="mt-2 h-4 w-4/5" /><Skeleton className="mt-5 h-8 w-1/2" />
        </div>
      ))}
    </div>
  );
}

export function JobsPage() {
  const [searchParams] = useSearchParams();
  const [types, setTypes] = useState([]);
  const [modes, setModes] = useState([]);
  const [sort, setSort] = useState('newest');
  const savedJobIds = useAppStore((state) => state.savedJobIds);
  const toggleSavedJob = useAppStore((state) => state.toggleSavedJob);

  const filters = useMemo(() => ({
    keyword: searchParams.get('q') || '',
    location: searchParams.get('location') || '',
    experience: searchParams.get('experience') || '',
    types,
    modes,
  }), [modes, searchParams, types]);

  const jobsQuery = useQuery({
    queryKey: ['jobs', filters],
    queryFn: () => catalogService.listJobs(filters),
  });

  const sortedJobs = useMemo(() => {
    const result = [...(jobsQuery.data || [])];
    if (sort === 'salary') return result.sort((a, b) => b.salary.localeCompare(a.salary));
    return result.sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt));
  }, [jobsQuery.data, sort]);

  function toggleFilter(setter, value) {
    setter((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
  }

  function clearFilters() {
    setTypes([]);
    setModes([]);
  }

  const filterContent = (
    <div className="grid gap-6">
      <FilterGroup title="Employment type" options={EMPLOYMENT_TYPES} selected={types} onChange={(value) => toggleFilter(setTypes, value)} />
      <FilterGroup title="Work mode" options={WORK_MODES} selected={modes} onChange={(value) => toggleFilter(setModes, value)} />
      {(types.length > 0 || modes.length > 0) && <Button variant="ghost" size="sm" onClick={clearFilters}><X aria-hidden="true" />Clear filters</Button>}
    </div>
  );

  return (
    <div className="page-container py-10 sm:py-12">
      <header className="max-w-3xl">
        <p className="text-sm font-bold text-[var(--cb-primary)]">Explore opportunities</p>
        <h1 className="mt-2 font-heading text-3xl font-extrabold tracking-[-0.035em] sm:text-4xl">Find work where you can grow</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--cb-text-secondary)]">Search skills-first openings from transparent demo employers across India.</p>
      </header>
      <div className="mt-7"><JobSearchBar compact initialValues={filters} /></div>

      <details className="surface-card mt-5 p-4 lg:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between font-semibold"><span className="inline-flex items-center gap-2"><SlidersHorizontal className="size-4" />Filters</span><span className="text-xs text-[var(--cb-primary)]">{types.length + modes.length} selected</span></summary>
        <div className="mt-5">{filterContent}</div>
      </details>

      <div className="mt-8 grid gap-8 lg:grid-cols-[230px_minmax(0,1fr)]">
        <aside className="hidden lg:block" aria-label="Job filters">
          <div className="surface-card sticky top-24 p-5">
            <div className="mb-6 flex items-center gap-2 font-heading font-bold"><SlidersHorizontal className="size-4 text-[var(--cb-primary)]" />Filters</div>
            {filterContent}
          </div>
        </aside>

        <section aria-labelledby="job-results-title">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 id="job-results-title" className="font-heading text-xl font-bold">Job results</h2>
              <p className="mt-1 text-xs text-[var(--cb-text-muted)]">{jobsQuery.isLoading ? 'Finding roles…' : `${sortedJobs.length} opportunities found`}</p>
            </div>
            <label className="flex items-center gap-2 text-xs font-semibold text-[var(--cb-text-secondary)]">
              Sort by
              <select value={sort} onChange={(event) => setSort(event.target.value)} className="h-9 rounded-lg border bg-[var(--cb-surface)] px-3 text-sm outline-none focus:border-[var(--cb-primary)]">
                <option value="newest">Newest</option>
                <option value="salary">Salary</option>
              </select>
            </label>
          </div>

          {jobsQuery.isLoading && <JobsLoading />}
          {jobsQuery.isError && <EmptyState icon={BriefcaseBusiness} title="Jobs could not be loaded" description="Something interrupted the demo service. Please try again." actionLabel="Try again" onAction={() => jobsQuery.refetch()} />}
          {jobsQuery.isSuccess && sortedJobs.length === 0 && <EmptyState title="No roles match these filters" description="Try a broader keyword, location, or remove one of your filters." actionLabel="Clear filters" onAction={clearFilters} />}
          {jobsQuery.isSuccess && sortedJobs.length > 0 && (
            <div className="grid gap-4 xl:grid-cols-2">
              {sortedJobs.map((job) => <JobCard key={job.id} job={job} isSaved={savedJobIds.includes(job.id)} onSave={toggleSavedJob} />)}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
