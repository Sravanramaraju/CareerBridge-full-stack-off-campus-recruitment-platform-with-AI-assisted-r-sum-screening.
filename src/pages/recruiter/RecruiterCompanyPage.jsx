import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BadgeCheck, Building2, Check, Globe2, MapPin, Save, UsersRound } from 'lucide-react';
import { Badge } from '@/src/components/ui/Badge';
import { Button } from '@/src/components/ui/Button';
import { Input, TextArea } from '@/src/components/ui/Input';
import { useDocumentTitle } from '@/src/hooks/useDocumentTitle';
import { EmptyState, Skeleton } from '@/src/components/ui/Feedback';
import { useToast } from '@/src/components/feedback/ToastProvider';
import { recruiterService } from '@/src/services/recruiterService';
import { queryKeys } from '@/src/services/queryKeys';

const EMPTY_COMPANY = { name: '', industry: '', website: '', size: '', about: '', benefits: [], locations: [], companyType: '', headquarters: '', foundedYear: '' };

export function RecruiterCompanyPage() {
  useDocumentTitle('Company profile');
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const companyQuery = useQuery({ queryKey: queryKeys.recruiterCompany(), queryFn: ({ signal }) => recruiterService.getCompany({ signal }) });
  const [editedDraft, setDraft] = useState(null);
  const [saved, setSaved] = useState(false);
  const draft = editedDraft || companyQuery.data || EMPTY_COMPANY;
  const companyMutation = useMutation({
    mutationFn: (updates) => recruiterService.updateCompany(updates),
    onSuccess: (company) => {
      queryClient.setQueryData(queryKeys.recruiterCompany(), company);
      setDraft(null);
      setSaved(true);
      showToast('Company profile updated.');
    },
    onError: (error) => showToast(error instanceof Error ? error.message : 'Unable to update company profile.', { tone: 'error' }),
  });

  function updateField(field, value) {
    setSaved(false);
    setDraft((current) => ({ ...(current || companyQuery.data || EMPTY_COMPANY), [field]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    companyMutation.mutate({
      name: draft.name,
      industry: draft.industry,
      website: draft.website || '',
      size: draft.size || null,
      about: draft.about || null,
      companyType: draft.companyType || null,
      headquarters: draft.headquarters || null,
      foundedYear: draft.foundedYear ? Number(draft.foundedYear) : null,
      benefits: typeof draft.benefits === 'string' ? draft.benefits.split(',').map((item) => item.trim()).filter(Boolean) : draft.benefits,
      locations: typeof draft.locations === 'string' ? draft.locations.split(',').map((item) => item.trim()).filter(Boolean) : draft.locations,
    });
  }

  const benefitValue = Array.isArray(draft.benefits) ? draft.benefits.join(', ') : draft.benefits;
  const locationValue = Array.isArray(draft.locations) ? draft.locations.join(', ') : draft.locations;

  if (companyQuery.isLoading) return <div aria-label="Loading company profile"><Skeleton className="h-24" /><Skeleton className="mt-6 h-96" /></div>;
  if (companyQuery.isError) return <EmptyState icon={Building2} title="Company profile could not be loaded" description="Please try again in a moment." actionLabel="Try again" onAction={() => companyQuery.refetch()} />;

  return (
    <div>
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--cb-primary)]">Employer presence</p><h1 className="mt-2 font-heading text-3xl font-extrabold tracking-[-0.035em]">Company profile</h1><p className="mt-2 max-w-2xl text-sm text-[var(--cb-text-secondary)]">Give candidates useful context about the organisation before they apply.</p></div>{saved && <output className="flex items-center gap-2 text-sm font-bold text-[var(--cb-emerald)]"><Check className="size-4" />Changes saved</output>}</header>

      <div className="mt-7 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_330px]">
        <form onSubmit={handleSubmit} className="grid gap-5">
          <section className="surface-card p-6"><h2 className="font-heading text-lg font-bold">Company basics</h2><div className="mt-5 grid gap-5 sm:grid-cols-2">
            <label htmlFor="company-name" className="grid gap-1.5 text-sm font-semibold">Company name<Input id="company-name" value={draft.name} onChange={(event) => updateField('name', event.target.value)} required /></label>
            <label htmlFor="company-industry" className="grid gap-1.5 text-sm font-semibold">Industry<Input id="company-industry" value={draft.industry} onChange={(event) => updateField('industry', event.target.value)} required /></label>
            <label htmlFor="company-website" className="grid gap-1.5 text-sm font-semibold">Website<Input id="company-website" type="url" value={draft.website} onChange={(event) => updateField('website', event.target.value)} /></label>
            <label htmlFor="company-size" className="grid gap-1.5 text-sm font-semibold">Company size<Input id="company-size" value={draft.size || ''} onChange={(event) => updateField('size', event.target.value)} /></label>
            <label htmlFor="company-type" className="grid gap-1.5 text-sm font-semibold">Company type<Input id="company-type" value={draft.companyType || ''} onChange={(event) => updateField('companyType', event.target.value)} /></label>
            <label htmlFor="company-headquarters" className="grid gap-1.5 text-sm font-semibold">Headquarters<Input id="company-headquarters" value={draft.headquarters || ''} onChange={(event) => updateField('headquarters', event.target.value)} /></label>
            <label htmlFor="company-founded" className="grid gap-1.5 text-sm font-semibold">Founded year<Input id="company-founded" type="number" min="1800" max={new Date().getFullYear()} value={draft.foundedYear || ''} onChange={(event) => updateField('foundedYear', event.target.value)} /></label>
          </div></section>
          <section className="surface-card p-6"><h2 className="font-heading text-lg font-bold">About</h2><p className="mt-1 text-xs text-[var(--cb-text-muted)]">Explain the problem your company solves and how teams contribute.</p><label htmlFor="company-about" className="sr-only">About the company</label><TextArea id="company-about" className="mt-4 min-h-40" value={draft.about || ''} onChange={(event) => updateField('about', event.target.value)} maxLength={800} /><p className="mt-1 text-right text-xs text-[var(--cb-text-muted)]">{(draft.about || '').length}/800</p></section>
          <section className="surface-card p-6"><h2 className="font-heading text-lg font-bold">Benefits and locations</h2><div className="mt-5 grid gap-5"><label htmlFor="company-benefits" className="grid gap-1.5 text-sm font-semibold">Benefits<span className="text-xs font-normal text-[var(--cb-text-muted)]">Comma-separated, specific benefits candidates can verify.</span><Input id="company-benefits" value={benefitValue} onChange={(event) => updateField('benefits', event.target.value)} /></label><label htmlFor="company-locations" className="grid gap-1.5 text-sm font-semibold">Locations<span className="text-xs font-normal text-[var(--cb-text-muted)]">Comma-separated offices or supported remote regions.</span><Input id="company-locations" value={locationValue} onChange={(event) => updateField('locations', event.target.value)} /></label></div></section>
          <div className="flex justify-end"><Button type="submit" size="lg" disabled={companyMutation.isPending}><Save />{companyMutation.isPending ? 'Saving…' : 'Save company profile'}</Button></div>
        </form>

        <aside className="grid gap-5 lg:sticky lg:top-24">
          <section className="surface-card overflow-hidden"><div className="h-20 bg-[var(--cb-primary-soft)]" /><div className="px-6 pb-6"><span className="-mt-8 grid size-16 place-items-center rounded-2xl border-4 border-[var(--cb-surface)] text-lg font-extrabold text-white" style={{ backgroundColor: draft.accent || 'var(--cb-primary)' }}>{draft.initials || draft.name.split(' ').map((word) => word[0]).join('').slice(0, 2)}</span><h2 className="mt-4 font-heading text-xl font-extrabold">{draft.name}</h2><p className="mt-1 flex items-center gap-1.5 text-xs font-bold text-[var(--cb-emerald)]"><BadgeCheck className="size-4" />{draft.verificationStatus} employer</p><div className="mt-4 grid gap-2 text-xs text-[var(--cb-text-secondary)]"><p className="flex items-center gap-2"><Building2 className="size-4 text-[var(--cb-text-muted)]" />{draft.industry}</p><p className="flex items-center gap-2"><UsersRound className="size-4 text-[var(--cb-text-muted)]" />{draft.size}</p><p className="flex items-center gap-2"><Globe2 className="size-4 text-[var(--cb-text-muted)]" />{draft.website}</p><p className="flex items-center gap-2"><MapPin className="size-4 text-[var(--cb-text-muted)]" />{locationValue}</p></div><div className="mt-4 flex flex-wrap gap-1.5">{benefitValue.split(',').filter(Boolean).slice(0, 3).map((item) => <Badge key={item.trim()}>{item.trim()}</Badge>)}</div></div></section>
          <section className="rounded-2xl border border-[var(--cb-emerald)] bg-[var(--cb-emerald-soft)] p-5"><p className="flex items-center gap-2 text-sm font-bold text-[var(--cb-emerald)]"><BadgeCheck className="size-4" />Verification: {draft.verificationStatus}</p><p className="mt-2 text-xs leading-5 text-[var(--cb-text-secondary)]">Verification is managed by CareerBridge administrators and controls whether this company can publish public roles.</p></section>
        </aside>
      </div>
    </div>
  );
}
