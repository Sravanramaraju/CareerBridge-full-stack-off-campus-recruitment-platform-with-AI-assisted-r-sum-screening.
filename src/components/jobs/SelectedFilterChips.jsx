import { X } from 'lucide-react';

const labels = {
  types: 'Type',
  modes: 'Mode',
  salaryBands: 'Salary',
  industries: 'Industry',
  skills: 'Skill',
  experiences: 'Experience',
  locations: 'Location',
  companyTypes: 'Company',
};

export function SelectedFilterChips({ filters, onRemove }) {
  const selections = Object.entries(filters).flatMap(([key, values]) => (
    Array.isArray(values) ? values.map((value) => ({ key, value })) : []
  ));

  if (!selections.length) return null;

  return (
    <div className="mb-5 flex flex-wrap gap-2" aria-label="Selected job filters">
      {selections.map(({ key, value }) => (
        <button key={`${key}-${value}`} type="button" onClick={() => onRemove(key, value)} className="inline-flex items-center gap-1.5 rounded-full border border-[var(--cb-border)] bg-[var(--cb-surface)] px-3 py-1.5 text-xs font-semibold text-[var(--cb-text-secondary)] hover:border-[var(--cb-primary)] hover:text-[var(--cb-primary)]">
          <span className="text-[var(--cb-text-muted)]">{labels[key]}:</span> {value}<X className="size-3.5" aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}
