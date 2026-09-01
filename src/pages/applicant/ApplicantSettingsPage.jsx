import { useState } from 'react';
import { Bell, LogOut, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/src/components/ui/Button';
import { PageHeader } from '@/src/components/ui/PageHeader';
import { useAppStore } from '@/src/store/useAppStore';

export function ApplicantSettingsPage() {
  const session = useAppStore((state) => state.session);
  const logout = useAppStore((state) => state.logout);
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState({ updates: true, recommendations: true, resources: false });
  function handleLogout() { logout(); void navigate('/', { replace: true }); }

  return (
    <div className="max-w-3xl">
      <PageHeader eyebrow="Account" title="Settings" description="Manage local demo preferences and your current CareerBridge session." />
      <div className="mt-7 grid gap-5">
        <section className="surface-card p-6"><h2 className="font-heading text-lg font-bold">Account details</h2><dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2"><div><dt className="text-xs font-bold text-[var(--cb-text-muted)]">Name</dt><dd className="mt-1 font-semibold">{session?.name}</dd></div><div><dt className="text-xs font-bold text-[var(--cb-text-muted)]">Email</dt><dd className="mt-1 font-semibold">{session?.email}</dd></div></dl></section>
        <section className="surface-card p-6"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-[var(--cb-primary-soft)] text-[var(--cb-primary)]"><Bell /></span><div><h2 className="font-heading text-lg font-bold">Notifications</h2><p className="text-xs text-[var(--cb-text-muted)]">Saved as interface preferences for this session.</p></div></div><div className="mt-5 divide-y divide-[var(--cb-divider)]">{[['updates', 'Application updates', 'Status changes and recruiter messages'], ['recommendations', 'Matching opportunities', 'Roles aligned with your profile and preferences'], ['resources', 'Career resources', 'Occasional preparation guides']].map(([key, title, copy]) => <label key={key} className="flex cursor-pointer items-center justify-between gap-4 py-4"><span><strong className="block text-sm">{title}</strong><span className="mt-1 block text-xs text-[var(--cb-text-muted)]">{copy}</span></span><input type="checkbox" aria-label={title} checked={preferences[key]} onChange={() => setPreferences({ ...preferences, [key]: !preferences[key] })} className="size-4 accent-[var(--cb-primary)]" /></label>)}</div></section>
        <section className="surface-card p-6"><div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 text-[var(--cb-emerald)]" /><div><h2 className="font-heading text-lg font-bold">Demo privacy</h2><p className="mt-2 text-sm leading-6 text-[var(--cb-text-secondary)]">Profile changes and applications remain in this browser&apos;s local storage. No personal information is uploaded by this frontend demonstration.</p></div></div></section>
        <section className="rounded-2xl border border-[var(--cb-danger)] bg-[var(--cb-danger-soft)] p-6"><h2 className="font-heading text-lg font-bold text-[var(--cb-danger)]">End this session</h2><p className="mt-2 text-sm text-[var(--cb-text-secondary)]">Logging out keeps your local demo data available for your next sign-in.</p><Button variant="danger" className="mt-5" onClick={handleLogout}><LogOut />Log out</Button></section>
      </div>
    </div>
  );
}
