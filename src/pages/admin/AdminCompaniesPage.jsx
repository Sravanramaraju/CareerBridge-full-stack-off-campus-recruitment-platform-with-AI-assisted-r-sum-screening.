import { useMemo, useState } from 'react';
import { Building2, Check, Search, X } from 'lucide-react';
import { Badge } from '@/src/components/ui/Badge';
import { Button } from '@/src/components/ui/Button';
import { EmptyState } from '@/src/components/ui/Feedback';
import { adminCompanyReviews } from '@/src/data/adminData';
import { useAppStore } from '@/src/store/useAppStore';

function statusVariant(status) {
  if (status === 'Verified') return 'success';
  if (status === 'Needs changes') return 'danger';
  return 'warning';
}

export function AdminCompaniesPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const states = useAppStore((state) => state.adminCompanyStates);
  const setState = useAppStore((state) => state.setAdminCompanyState);
  const companies = useMemo(() => adminCompanyReviews.filter((company) => {
    const status = states[company.id];
    const keyword = search.trim().toLocaleLowerCase();
    return (filter === 'All' || status === filter) && (!keyword || [company.name, company.industry].join(' ').toLocaleLowerCase().includes(keyword));
  }), [filter, search, states]);

  return (
    <div>
      <header><p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--cb-primary)]">Verification queue</p><h1 className="mt-2 font-heading text-3xl font-extrabold tracking-[-0.035em]">Companies</h1><p className="mt-2 text-sm text-[var(--cb-text-secondary)]">Review fictional employer submissions and record a local moderation decision.</p></header>
      <section className="surface-card mt-7 flex flex-col gap-3 p-4 sm:flex-row" aria-label="Company review filters"><label className="flex h-10 flex-1 items-center gap-2 rounded-lg border bg-[var(--cb-surface)] px-3"><Search className="size-4 text-[var(--cb-text-muted)]" /><span className="sr-only">Search companies</span><input value={search} onChange={(event) => setSearch(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm outline-none" placeholder="Search company or industry" /></label><select aria-label="Filter company status" value={filter} onChange={(event) => setFilter(event.target.value)} className="h-10 rounded-lg border bg-[var(--cb-surface)] px-3 text-sm outline-none"><option>All</option><option>Pending</option><option>Verified</option><option>Needs changes</option></select></section>
      {companies.length === 0 && <EmptyState className="mt-6" icon={Building2} title="No company reviews found" description="Try another search or verification status." />}
      {companies.length > 0 && <div className="surface-card mt-6 overflow-hidden"><div className="hidden grid-cols-[1.2fr_0.8fr_0.7fr_110px_220px] gap-4 border-b bg-[var(--cb-bg-subtle)] px-5 py-3 text-[10px] font-bold uppercase tracking-wide text-[var(--cb-text-muted)] lg:grid"><span>Company</span><span>Industry</span><span>Submitted</span><span>Status</span><span>Decision</span></div><div className="divide-y divide-[var(--cb-divider)]">{companies.map((company) => { const status = states[company.id]; return <article key={company.id} className="grid gap-4 p-5 lg:grid-cols-[1.2fr_0.8fr_0.7fr_110px_220px] lg:items-center"><div><h2 className="text-sm font-bold">{company.name}</h2><p className="mt-1 text-xs text-[var(--cb-text-muted)]">{company.evidence}</p></div><p className="text-sm text-[var(--cb-text-secondary)]">{company.industry}</p><p className="text-xs text-[var(--cb-text-secondary)]">{new Date(company.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p><Badge variant={statusVariant(status)} className="w-fit">{status}</Badge><div className="flex gap-2"><Button size="sm" variant={status === 'Verified' ? 'soft' : 'secondary'} onClick={() => setState(company.id, 'Verified')}><Check />Approve</Button><Button size="sm" variant={status === 'Needs changes' ? 'dangerSoft' : 'ghost'} onClick={() => setState(company.id, 'Needs changes')}><X />Changes</Button></div></article>; })}</div></div>}
      <p className="mt-4 text-xs leading-5 text-[var(--cb-text-muted)]">Verification actions are mock controls and do not represent a real identity or compliance review.</p>
    </div>
  );
}
