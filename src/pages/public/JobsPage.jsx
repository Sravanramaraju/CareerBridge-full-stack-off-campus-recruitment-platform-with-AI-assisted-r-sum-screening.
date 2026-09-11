import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BriefcaseBusiness, SlidersHorizontal } from 'lucide-react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { JobCard } from '@/src/components/jobs/JobCard';
import { JobFilterPanel } from '@/src/components/jobs/JobFilterPanel';
import { JobSearchBar } from '@/src/components/jobs/JobSearchBar';
import { SelectedFilterChips } from '@/src/components/jobs/SelectedFilterChips';
import { EmptyState, Skeleton } from '@/src/components/ui/Feedback';
import { Pagination } from '@/src/components/ui/Pagination';
import { Drawer, DrawerContent, DrawerTrigger } from '@/src/components/ui/Drawer';
import { Button } from '@/src/components/ui/Button';
import { jobsService } from '@/src/services/jobsService';
import { queryKeys } from '@/src/services/queryKeys';
import { useSavedJobs } from '@/src/features/jobs/useSavedJobs';
import { useDocumentTitle } from '@/src/hooks/useDocumentTitle';
import { readJobFacets, writeJobFacets } from '@/src/lib/jobFilterParams';

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
  useDocumentTitle('Explore jobs');
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const [facetFilters, setFacetFilters] = useState(() => readJobFacets(searchParams));
  const [sort, setSort] = useState('recommended');
  const [page, setPage] = useState(1);
  const { savedJobIds, toggleSavedJob } = useSavedJobs();

  const filters = useMemo(() => ({
    keyword: searchParams.get('q') || '',
    location: searchParams.get('location') || '',
    experience: searchParams.get('experience') || '',
    ...facetFilters,
    sort,
    page,
    pageSize: 6,
  }), [facetFilters, page, searchParams, sort]);

  const jobsQuery = useQuery({
    queryKey: queryKeys.jobs(filters),
    queryFn: ({ signal }) => jobsService.getJobs(filters, { signal }),
  });

  const visibleJobs = jobsQuery.data?.items || [];
  const pagination = jobsQuery.data?.pagination;
  const pageCount = pagination?.totalPages || 0;
  const currentPage = pagination?.page || page;

  function updateFacetFilters(next) {
    setFacetFilters(next);
    setSearchParams(writeJobFacets(searchParams, next), { replace: true });
  }

  function toggleFilter(key, value) {
    setPage(1);
    updateFacetFilters({
      ...facetFilters,
      [key]: facetFilters[key].includes(value)
        ? facetFilters[key].filter((item) => item !== value)
        : [...facetFilters[key], value],
    });
  }

  function clearFilters() {
    setPage(1);
    updateFacetFilters({ types: [], modes: [], salaryBands: [], industries: [], skills: [], experiences: [], locations: [], companyTypes: [], datePosted: '' });
  }

  const selectedFilterCount = Object.values(facetFilters).reduce(
    (total, value) => total + (Array.isArray(value) ? value.length : Number(Boolean(value))),
    0,
  );

  const filterContent = <JobFilterPanel
    filters={facetFilters}
    onToggle={toggleFilter}
    onDateChange={(datePosted) => {
      setPage(1);
      updateFacetFilters({ ...facetFilters, datePosted });
    }}
    onClear={clearFilters}
  />;

  return (
    <div className="page-container py-10 sm:py-12">
      <header className="max-w-3xl">
        <p className="text-sm font-bold text-[var(--cb-primary)]">Explore opportunities</p>
        <h1 className="mt-2 font-heading text-3xl font-extrabold tracking-[-0.035em] sm:text-4xl">Find work where you can grow</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--cb-text-secondary)]">Search skills-first openings from transparent employers across India.</p>
      </header>
      <div className="mt-7"><JobSearchBar compact initialValues={filters} /></div>

      <div className="mt-5 lg:hidden">
        <Drawer>
          <DrawerTrigger render={<Button variant="secondary" className="w-full justify-between" />}>
            <span className="inline-flex items-center gap-2"><SlidersHorizontal className="size-4" />Filters</span>
            <span className="text-xs text-[var(--cb-primary)]">{selectedFilterCount} selected</span>
          </DrawerTrigger>
          <DrawerContent side="bottom" title="Filter jobs" description="Narrow opportunities by role requirements and work preferences.">{filterContent}</DrawerContent>
        </Drawer>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[230px_minmax(0,1fr)]">
        <aside className="hidden lg:block" aria-label="Job filters">
          <div className="surface-card sticky top-24 p-5">
            <div className="mb-6 flex items-center gap-2 font-heading font-bold"><SlidersHorizontal className="size-4 text-[var(--cb-primary)]" />Filters</div>
            {filterContent}
          </div>
        </aside>

        <section aria-labelledby="job-results-title">
          <SelectedFilterChips filters={facetFilters} onRemove={toggleFilter} />
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 id="job-results-title" className="font-heading text-xl font-bold">Job results</h2>
              <p className="mt-1 text-xs text-[var(--cb-text-muted)]" aria-live="polite">{jobsQuery.isLoading ? 'Finding roles…' : `${pagination?.total || 0} opportunities found`}</p>
            </div>
            <label className="flex items-center gap-2 text-xs font-semibold text-[var(--cb-text-secondary)]">
              Sort by
              <select value={sort} onChange={(event) => { setSort(event.target.value); setPage(1); }} className="h-9 rounded-lg border bg-[var(--cb-surface)] px-3 text-sm outline-none focus:border-[var(--cb-primary)]">
                <option value="recommended">Recommended</option>
                <option value="newest">Newest</option>
                <option value="salary">Salary</option>
              </select>
            </label>
          </div>

          {jobsQuery.isLoading && <JobsLoading />}
          {jobsQuery.isError && <EmptyState icon={BriefcaseBusiness} title="Jobs could not be loaded" description="Please try again in a moment." actionLabel="Try again" onAction={() => jobsQuery.refetch()} />}
          {jobsQuery.isSuccess && visibleJobs.length === 0 && <EmptyState title="No roles match these filters" description="Try a broader keyword, location, or remove one of your filters." actionLabel="Clear filters" onAction={clearFilters} />}
          {jobsQuery.isSuccess && visibleJobs.length > 0 && (
            <div className="grid gap-4 xl:grid-cols-2">
              {visibleJobs.map((job) => <JobCard key={job.id} job={job} detailState={{ from: `${location.pathname}${location.search}` }} isSaved={savedJobIds.has(job.id)} onSave={toggleSavedJob} />)}
            </div>
          )}
          {jobsQuery.isSuccess && pageCount > 1 && <Pagination currentPage={currentPage} pageCount={pageCount} onPageChange={setPage} />}
        </section>
      </div>
    </div>
  );
}
