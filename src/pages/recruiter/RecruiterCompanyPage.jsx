import { useState } from 'react';
import { BadgeCheck, Building2, Check, Globe2, MapPin, Save, UsersRound } from 'lucide-react';
import { Badge } from '@/src/components/ui/Badge';
import { Button } from '@/src/components/ui/Button';
import { Input, TextArea } from '@/src/components/ui/Input';
import { useAppStore } from '@/src/store/useAppStore';

export function RecruiterCompanyPage() {
  const companyProfile = useAppStore((state) => state.companyProfile);
  const updateCompanyProfile = useAppStore((state) => state.updateCompanyProfile);
  const [draft, setDraft] = useState(companyProfile);
  const [saved, setSaved] = useState(false);

  function updateField(field, value) {
    setSaved(false);
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    updateCompanyProfile({
      ...draft,
      benefits: typeof draft.benefits === 'string' ? draft.benefits.split(',').map((item) => item.trim()).filter(Boolean) : draft.benefits,
      locations: typeof draft.locations === 'string' ? draft.locations.split(',').map((item) => item.trim()).filter(Boolean) : draft.locations,
    });
    setSaved(true);
  }

  const benefitValue = Array.isArray(draft.benefits) ? draft.benefits.join(', ') : draft.benefits;
  const locationValue = Array.isArray(draft.locations) ? draft.locations.join(', ') : draft.locations;

  return (
    <div>
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--cb-primary)]">Employer presence</p><h1 className="mt-2 font-heading text-3xl font-extrabold tracking-[-0.035em]">Company profile</h1><p className="mt-2 max-w-2xl text-sm text-[var(--cb-text-secondary)]">Give candidates useful context about the organisation before they apply.</p></div>{saved && <p role="status" className="flex items-center gap-2 text-sm font-bold text-[var(--cb-emerald)]"><Check className="size-4" />Changes saved</p>}</header>

      <div className="mt-7 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_330px]">
        <form onSubmit={handleSubmit} className="grid gap-5">
          <section className="surface-card p-6"><h2 className="font-heading text-lg font-bold">Company basics</h2><div className="mt-5 grid gap-5 sm:grid-cols-2">
            <label htmlFor="company-name" className="grid gap-1.5 text-sm font-semibold">Company name<Input id="company-name" value={draft.name} onChange={(event) => updateField('name', event.target.value)} required /></label>
            <label htmlFor="company-industry" className="grid gap-1.5 text-sm font-semibold">Industry<Input id="company-industry" value={draft.industry} onChange={(event) => updateField('industry', event.target.value)} required /></label>
            <label htmlFor="company-website" className="grid gap-1.5 text-sm font-semibold">Website<Input id="company-website" type="url" value={draft.website} onChange={(event) => updateField('website', event.target.value)} /></label>
            <label htmlFor="company-size" className="grid gap-1.5 text-sm font-semibold">Company size<Input id="company-size" value={draft.size} onChange={(event) => updateField('size', event.target.value)} /></label>
          </div></section>
          <section className="surface-card p-6"><h2 className="font-heading text-lg font-bold">About</h2><p className="mt-1 text-xs text-[var(--cb-text-muted)]">Explain the problem your company solves and how teams contribute.</p><label htmlFor="company-about" className="sr-only">About the company</label><TextArea id="company-about" className="mt-4 min-h-40" value={draft.about} onChange={(event) => updateField('about', event.target.value)} maxLength={800} /><p className="mt-1 text-right text-xs text-[var(--cb-text-muted)]">{draft.about.length}/800</p></section>
          <section className="surface-card p-6"><h2 className="font-heading text-lg font-bold">Benefits and locations</h2><div className="mt-5 grid gap-5"><label htmlFor="company-benefits" className="grid gap-1.5 text-sm font-semibold">Benefits<span className="text-xs font-normal text-[var(--cb-text-muted)]">Comma-separated, specific benefits candidates can verify.</span><Input id="company-benefits" value={benefitValue} onChange={(event) => updateField('benefits', event.target.value)} /></label><label htmlFor="company-locations" className="grid gap-1.5 text-sm font-semibold">Locations<span className="text-xs font-normal text-[var(--cb-text-muted)]">Comma-separated offices or supported remote regions.</span><Input id="company-locations" value={locationValue} onChange={(event) => updateField('locations', event.target.value)} /></label></div></section>
          <div className="flex justify-end"><Button type="submit" size="lg"><Save />Save company profile</Button></div>
        </form>

        <aside className="grid gap-5 lg:sticky lg:top-24">
          <section className="surface-card overflow-hidden"><div className="h-20 bg-[var(--cb-primary-soft)]" /><div className="px-6 pb-6"><span className="-mt-8 grid size-16 place-items-center rounded-2xl border-4 border-[var(--cb-surface)] bg-[var(--cb-primary)] text-lg font-extrabold text-white">NL</span><h2 className="mt-4 font-heading text-xl font-extrabold">{draft.name}</h2><p className="mt-1 flex items-center gap-1.5 text-xs font-bold text-[var(--cb-emerald)]"><BadgeCheck className="size-4" />Mock verified employer</p><div className="mt-4 grid gap-2 text-xs text-[var(--cb-text-secondary)]"><p className="flex items-center gap-2"><Building2 className="size-4 text-[var(--cb-text-muted)]" />{draft.industry}</p><p className="flex items-center gap-2"><UsersRound className="size-4 text-[var(--cb-text-muted)]" />{draft.size}</p><p className="flex items-center gap-2"><Globe2 className="size-4 text-[var(--cb-text-muted)]" />{draft.website}</p><p className="flex items-center gap-2"><MapPin className="size-4 text-[var(--cb-text-muted)]" />{locationValue}</p></div><div className="mt-4 flex flex-wrap gap-1.5">{benefitValue.split(',').filter(Boolean).slice(0, 3).map((item) => <Badge key={item.trim()}>{item.trim()}</Badge>)}</div></div></section>
          <section className="rounded-2xl border border-[var(--cb-emerald)] bg-[var(--cb-emerald-soft)] p-5"><p className="flex items-center gap-2 text-sm font-bold text-[var(--cb-emerald)]"><BadgeCheck className="size-4" />Verification: {draft.verificationStatus}</p><p className="mt-2 text-xs leading-5 text-[var(--cb-text-secondary)]">This is a mock verification state for the portfolio. No real company identity service is connected.</p></section>
        </aside>
      </div>
    </div>
  );
}
