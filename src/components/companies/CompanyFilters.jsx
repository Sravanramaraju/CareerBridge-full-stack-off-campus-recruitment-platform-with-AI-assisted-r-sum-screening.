import { companies } from '@/src/data/mockData';
import { RotateCcw } from 'lucide-react';

const options = {
  industry: [...new Set(companies.map((company) => company.industry))],
  size: [...new Set(companies.map((company) => company.size))],
  location: [...new Set(companies.map((company) => company.location.split(',')[0]))],
  companyType: [...new Set(companies.map((company) => company.companyType))],
};

const labels = { industry: 'Industry', size: 'Company size', location: 'Location', companyType: 'Company type' };

export function CompanyFilters({ filters, onChange, onClear }) {
  const hasActiveFilters = Object.values(filters).some(Boolean);

  return (
    <div aria-label="Company filters">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Object.entries(options).map(([key, values]) => (
          <label key={key} className="grid gap-1.5 text-xs font-bold text-[var(--cb-text-secondary)]">
            {labels[key]}
            <select value={filters[key]} onChange={(event) => onChange(key, event.target.value)} className="h-10 rounded-lg border bg-[var(--cb-surface)] px-3 text-sm font-normal outline-none focus:border-[var(--cb-primary)]">
              <option value="">All</option>
              {values.map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </label>
        ))}
      </div>
      {hasActiveFilters && (
        <button type="button" onClick={onClear} className="mt-3 inline-flex min-h-9 items-center gap-2 rounded-lg px-2 text-xs font-bold text-[var(--cb-primary)] hover:bg-[var(--cb-primary-soft)]">
          <RotateCcw className="size-3.5" aria-hidden="true" />Clear company filters
        </button>
      )}
    </div>
  );
}
