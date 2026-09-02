import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Building2, Search } from 'lucide-react';
import { CompanyCard } from '@/src/components/companies/CompanyCard';
import { CompanyFilters } from '@/src/components/companies/CompanyFilters';
import { EmptyState, Skeleton } from '@/src/components/ui/Feedback';
import { companiesService } from '@/src/services/companiesService';
import { queryKeys } from '@/src/services/queryKeys';
import { useDocumentTitle } from '@/src/hooks/useDocumentTitle';

export function CompaniesPage() {
  useDocumentTitle('Explore companies');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ industry: '', size: '', location: '', companyType: '' });
  const companiesQuery = useQuery({ queryKey: queryKeys.companies(), queryFn: companiesService.getCompanies });
  const filteredCompanies = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase();
    return (companiesQuery.data || []).filter((company) => {
      const matchesSearch = !keyword || [company.name, company.industry, company.location].join(' ').toLocaleLowerCase().includes(keyword);
      return matchesSearch
        && (!filters.industry || company.industry === filters.industry)
        && (!filters.size || company.size === filters.size)
        && (!filters.location || company.location.startsWith(filters.location))
        && (!filters.companyType || company.companyType === filters.companyType);
    });
  }, [companiesQuery.data, filters, search]);

  return (
    <div className="page-container py-10 sm:py-14">
      <header className="grid gap-7 border-b border-[var(--cb-divider)] pb-10 lg:grid-cols-[1fr_420px] lg:items-end">
        <div className="max-w-2xl">
          <p className="text-sm font-bold text-[var(--cb-emerald)]">Verified demo employers</p>
          <h1 className="mt-2 font-heading text-3xl font-extrabold tracking-[-0.035em] sm:text-4xl">Know the company behind the role</h1>
          <p className="mt-3 text-sm leading-6 text-[var(--cb-text-secondary)]">Explore company focus, work location, and active openings before you decide to apply.</p>
        </div>
        <search aria-label="Search companies">
          <label className="flex h-12 items-center gap-3 rounded-xl border border-[var(--cb-border-strong)] bg-[var(--cb-surface)] px-4 focus-within:border-[var(--cb-primary)] focus-within:ring-3 focus-within:ring-[var(--cb-focus)]">
            <Search className="size-5 text-[var(--cb-text-muted)]" aria-hidden="true" />
            <span className="sr-only">Search companies</span>
            <input value={search} onChange={(event) => setSearch(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm outline-none" placeholder="Search company, industry, or city" />
          </label>
        </search>
      </header>

      <div className="surface-card mt-6 p-4"><CompanyFilters filters={filters} onChange={(key, value) => setFilters((current) => ({ ...current, [key]: value }))} onClear={() => setFilters({ industry: '', size: '', location: '', companyType: '' })} /></div>

      <section className="mt-9" aria-labelledby="company-results-title">
        <div className="flex items-center justify-between gap-4">
          <h2 id="company-results-title" className="font-heading text-xl font-bold">Companies</h2>
          <p className="text-xs text-[var(--cb-text-muted)]">{companiesQuery.isLoading ? 'Loading…' : `${filteredCompanies.length} profiles`}</p>
        </div>
        {companiesQuery.isLoading && (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 7 }, (_, index) => <div key={index} className="surface-card p-5"><Skeleton className="size-12" /><Skeleton className="mt-5 h-5 w-2/3" /><Skeleton className="mt-3 h-4 w-1/2" /><Skeleton className="mt-8 h-4 w-1/3" /></div>)}
          </div>
        )}
        {companiesQuery.isError && <EmptyState className="mt-5" icon={Building2} title="Companies could not be loaded" description="Please try again in a moment." actionLabel="Try again" onAction={() => companiesQuery.refetch()} />}
        {companiesQuery.isSuccess && filteredCompanies.length === 0 && <EmptyState className="mt-5" icon={Building2} title="No companies found" description="Try a different company, industry, or location." actionLabel="Clear all filters" onAction={() => { setSearch(''); setFilters({ industry: '', size: '', location: '', companyType: '' }); }} />}
        {companiesQuery.isSuccess && filteredCompanies.length > 0 && (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{filteredCompanies.map((company) => <CompanyCard key={company.id} company={company} />)}</div>
        )}
      </section>
    </div>
  );
}
