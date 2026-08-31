import { ArrowUpRight, BadgeCheck, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export function CompanyCard({ company }) {
  return (
    <article className="surface-card flex h-full flex-col p-5 transition-[border-color,transform,box-shadow] hover:-translate-y-0.5 hover:border-[var(--cb-border-strong)] hover:shadow-[var(--cb-shadow-raised)]">
      <div className="flex items-start justify-between gap-3">
        <div
          className="grid size-12 place-items-center rounded-xl text-sm font-extrabold text-white"
          style={{ backgroundColor: company.accent }}
          aria-hidden="true"
        >
          {company.initials}
        </div>
        <Link className="rounded-lg p-2 text-[var(--cb-text-muted)] hover:bg-[var(--cb-bg-subtle)] hover:text-[var(--cb-primary)]" to={`/companies/${company.id}`} aria-label={`View ${company.name}`}>
          <ArrowUpRight className="size-5" aria-hidden="true" />
        </Link>
      </div>
      <h3 className="mt-5 font-heading text-base font-bold">{company.name}</h3>
      <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-[var(--cb-emerald)]">
        <BadgeCheck className="size-4" aria-hidden="true" /> Verified employer
      </p>
      <p className="mt-3 text-sm text-[var(--cb-text-secondary)]">{company.industry}</p>
      <p className="mt-1 flex items-center gap-1.5 text-xs text-[var(--cb-text-muted)]"><MapPin className="size-3.5" aria-hidden="true" />{company.location}</p>
      <p className="mt-5 border-t border-[var(--cb-divider)] pt-4 text-sm font-semibold text-[var(--cb-primary)]">{company.openRoles} open roles</p>
    </article>
  );
}
