import { X } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { companies, jobs } from '@/src/data/mockData';
import { DATE_POSTED_OPTIONS, EMPLOYMENT_TYPES, SALARY_BANDS, WORK_MODES } from '@/src/domain/constants';

const INDUSTRIES = [...new Set(companies.map((company) => company.industry))];
const POPULAR_SKILLS = [...new Set(jobs.flatMap((job) => job.skills))].slice(0, 10);

function CheckboxGroup({ title, options, selected, onToggle }) {
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
              onChange={() => onToggle(option)}
            />
            {option}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function JobFilterPanel({ filters, onToggle, onDateChange, onClear }) {
  const selectedCount = filters.types.length
    + filters.modes.length
    + filters.salaryBands.length
    + filters.industries.length
    + filters.skills.length
    + (filters.datePosted ? 1 : 0);

  return (
    <div className="grid gap-6">
      <CheckboxGroup title="Employment type" options={EMPLOYMENT_TYPES} selected={filters.types} onToggle={(value) => onToggle('types', value)} />
      <CheckboxGroup title="Work mode" options={WORK_MODES} selected={filters.modes} onToggle={(value) => onToggle('modes', value)} />
      <CheckboxGroup title="Salary" options={SALARY_BANDS} selected={filters.salaryBands} onToggle={(value) => onToggle('salaryBands', value)} />
      <CheckboxGroup title="Company industry" options={INDUSTRIES} selected={filters.industries} onToggle={(value) => onToggle('industries', value)} />
      <CheckboxGroup title="Popular skills" options={POPULAR_SKILLS} selected={filters.skills} onToggle={(value) => onToggle('skills', value)} />
      <label className="grid gap-2 text-sm font-bold">
        Date posted
        <select
          value={filters.datePosted}
          onChange={(event) => onDateChange(event.target.value)}
          className="h-10 rounded-lg border bg-[var(--cb-surface)] px-3 text-sm font-normal text-[var(--cb-text-secondary)] outline-none focus:border-[var(--cb-primary)]"
        >
          <option value="">Any time</option>
          {DATE_POSTED_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      </label>
      {selectedCount > 0 && <Button variant="ghost" size="sm" onClick={onClear}><X aria-hidden="true" />Clear {selectedCount} filters</Button>}
    </div>
  );
}
