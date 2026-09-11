import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Building2, Check, Search, X } from 'lucide-react';
import { Badge } from '@/src/components/ui/Badge';
import { Button } from '@/src/components/ui/Button';
import { EmptyState, Skeleton } from '@/src/components/ui/Feedback';
import { TextArea } from '@/src/components/ui/Input';
import { Modal, ModalContent } from '@/src/components/ui/Modal';
import { Pagination } from '@/src/components/ui/Pagination';
import { useToast } from '@/src/components/feedback/ToastProvider';
import { useDocumentTitle } from '@/src/hooks/useDocumentTitle';
import { adminService } from '@/src/services/adminService';
import { queryKeys } from '@/src/services/queryKeys';

const statusOptions = [
  ['', 'All statuses'], ['PENDING', 'Pending'], ['VERIFIED', 'Verified'],
  ['NEEDS_CHANGES', 'Needs changes'], ['REJECTED', 'Rejected'],
];

function statusVariant(status) {
  if (status === 'VERIFIED') return 'success';
  if (status === 'NEEDS_CHANGES' || status === 'REJECTED') return 'danger';
  return 'warning';
}

export function AdminCompaniesPage() {
  useDocumentTitle('Company verification');
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [decision, setDecision] = useState(null);
  const [reason, setReason] = useState('');
  const filters = useMemo(() => ({ q: search.trim() || undefined, status: status || undefined, page, pageSize: 20 }), [page, search, status]);
  const companiesQuery = useQuery({
    queryKey: queryKeys.adminCompanies(filters),
    queryFn: ({ signal }) => adminService.getCompanies(filters, { signal }),
  });
  const moderationMutation = useMutation({
    mutationFn: ({ company, nextStatus, decisionReason }) => adminService.updateCompanyVerification(company.id, nextStatus, decisionReason),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.adminCompanies(filters), (current) => current ? {
        ...current, items: current.items.map((company) => company.id === updated.id ? updated : company),
      } : current);
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminDashboard() });
      setDecision(null);
      setReason('');
      showToast(`${updated.name} is now ${updated.verificationLabel.toLowerCase()}.`);
    },
    onError: (error) => showToast(error instanceof Error ? error.message : 'Unable to update company verification.', { tone: 'error' }),
  });
  const companies = companiesQuery.data?.items || [];
  const pagination = companiesQuery.data?.pagination;

  function changeSearch(value) { setSearch(value); setPage(1); }
  function changeStatus(value) { setStatus(value); setPage(1); }
  function submitDecision() {
    if (!decision || reason.trim().length < 3) return;
    moderationMutation.mutate({ company: decision.company, nextStatus: decision.status, decisionReason: reason });
  }

  return (
    <div>
      <header><p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--cb-primary)]">Verification queue</p><h1 className="mt-2 font-heading text-3xl font-extrabold tracking-[-0.035em]">Companies</h1><p className="mt-2 text-sm text-[var(--cb-text-secondary)]">Review employer profiles and record audited verification decisions.</p></header>
      <section className="surface-card mt-7 flex flex-col gap-3 p-4 sm:flex-row" aria-label="Company review filters"><label className="flex h-10 flex-1 items-center gap-2 rounded-lg border bg-[var(--cb-surface)] px-3"><Search className="size-4 text-[var(--cb-text-muted)]" /><span className="sr-only">Search companies</span><input value={search} onChange={(event) => changeSearch(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm outline-none" placeholder="Search company or industry" /></label><select aria-label="Filter company status" value={status} onChange={(event) => changeStatus(event.target.value)} className="h-10 rounded-lg border bg-[var(--cb-surface)] px-3 text-sm outline-none">{statusOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></section>
      {companiesQuery.isLoading && <div className="mt-6 grid gap-3">{Array.from({ length: 5 }, (_, index) => <Skeleton key={index} className="h-24" />)}</div>}
      {companiesQuery.isError && <EmptyState className="mt-6" icon={Building2} title="Company reviews could not be loaded" description="Please try again in a moment." actionLabel="Try again" onAction={() => companiesQuery.refetch()} />}
      {companiesQuery.isSuccess && companies.length === 0 && <EmptyState className="mt-6" icon={Building2} title="No company reviews found" description="Try another search or verification status." />}
      {companies.length > 0 && <div className="surface-card mt-6 overflow-hidden"><div className="hidden grid-cols-[1.2fr_0.8fr_0.7fr_110px_250px] gap-4 border-b bg-[var(--cb-bg-subtle)] px-5 py-3 text-[10px] font-bold uppercase tracking-wide text-[var(--cb-text-muted)] lg:grid"><span>Company</span><span>Industry</span><span>Submitted</span><span>Status</span><span>Decision</span></div><div className="divide-y divide-[var(--cb-divider)]">{companies.map((company) => <article key={company.id} className="grid gap-4 p-5 lg:grid-cols-[1.2fr_0.8fr_0.7fr_110px_250px] lg:items-center"><div><h2 className="text-sm font-bold">{company.name}</h2><p className="mt-1 text-xs text-[var(--cb-text-muted)]">{company.website || company.headquarters || `${company.memberCount} recruiter members`}</p></div><p className="text-sm text-[var(--cb-text-secondary)]">{company.industry || 'Not provided'}</p><p className="text-xs text-[var(--cb-text-secondary)]">{new Date(company.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p><Badge variant={statusVariant(company.verificationStatus)} className="w-fit">{company.verificationLabel}</Badge><div className="flex flex-wrap gap-2"><Button size="sm" variant={company.verificationStatus === 'VERIFIED' ? 'soft' : 'secondary'} disabled={moderationMutation.isPending || company.verificationStatus === 'VERIFIED'} onClick={() => moderationMutation.mutate({ company, nextStatus: 'VERIFIED' })}><Check />Approve</Button><Button size="sm" variant="ghost" disabled={moderationMutation.isPending} onClick={() => setDecision({ company, status: 'NEEDS_CHANGES' })}><X />Changes</Button><Button size="sm" variant="dangerSoft" disabled={moderationMutation.isPending} onClick={() => setDecision({ company, status: 'REJECTED' })}>Reject</Button></div></article>)}</div></div>}
      {pagination && <Pagination currentPage={pagination.page} pageCount={pagination.totalPages} onPageChange={setPage} />}

      <Modal open={Boolean(decision)} onOpenChange={(open) => { if (!open) { setDecision(null); setReason(''); } }}><ModalContent title={decision?.status === 'REJECTED' ? `Reject ${decision.company.name}?` : `Request changes from ${decision?.company.name || 'this company'}?`} description="Provide a clear reason. The company’s recruiters will be notified and the decision will be recorded in the audit log."><TextArea value={reason} onChange={(event) => setReason(event.target.value)} minLength={3} maxLength={500} aria-label="Company moderation reason" placeholder="Explain the evidence or profile changes required…" /><div className="mt-4 flex justify-end gap-2"><Button variant="secondary" onClick={() => { setDecision(null); setReason(''); }}>Cancel</Button><Button variant={decision?.status === 'REJECTED' ? 'danger' : 'primary'} disabled={reason.trim().length < 3 || moderationMutation.isPending} onClick={submitDecision}>{moderationMutation.isPending ? 'Saving…' : 'Confirm decision'}</Button></div></ModalContent></Modal>
    </div>
  );
}
