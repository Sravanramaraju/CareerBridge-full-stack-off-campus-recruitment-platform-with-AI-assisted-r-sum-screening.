import { Bell, LogOut, ShieldCheck, UserRound } from 'lucide-react';
import { Avatar } from '@/src/components/ui/Avatar';
import { Button } from '@/src/components/ui/Button';
import { useAppStore } from '@/src/store/useAppStore';
import { useDocumentTitle } from '@/src/hooks/useDocumentTitle';
import { useLogout } from '@/src/features/auth/useLogout';
import { useAccountSettings } from '@/src/features/settings/useAccountSettings';
import { EmptyState, Skeleton } from '@/src/components/ui/Feedback';

export function RecruiterSettingsPage() {
  useDocumentTitle('Recruiter settings');
  const session = useAppStore((state) => state.session);
  const { logout, isLoggingOut } = useLogout();
  const { settings, isLoading, error, refetch, updateSetting } = useAccountSettings();

  return (
    <div className="max-w-3xl">
      <header><p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--cb-primary)]">Recruiter account</p><h1 className="mt-2 font-heading text-3xl font-extrabold tracking-[-0.035em]">Settings</h1><p className="mt-2 text-sm text-[var(--cb-text-secondary)]">Manage your hiring identity and notification preferences.</p></header>
      <div className="mt-7 grid gap-5">
        <section className="surface-card p-6"><div className="flex items-center gap-4"><Avatar name={session?.name} size="lg" /><div><p className="flex items-center gap-2 text-xs font-bold text-[var(--cb-primary)]"><UserRound className="size-4" />RECRUITER PROFILE</p><h2 className="mt-1 font-heading text-xl font-bold">{session?.name}</h2><p className="mt-1 text-sm text-[var(--cb-text-secondary)]">{session?.email}</p></div></div></section>
        <section className="surface-card p-6"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-[var(--cb-primary-soft)] text-[var(--cb-primary)]"><Bell /></span><div><h2 className="font-heading text-lg font-bold">Hiring notifications</h2><p className="text-xs text-[var(--cb-text-muted)]">Choose which account updates stay prominent.</p></div></div>{isLoading && <Skeleton className="mt-5 h-48" />}{error && <EmptyState className="mt-5" title="Settings could not be loaded" actionLabel="Try again" onAction={() => refetch()} />}{settings && <div className="mt-5 divide-y divide-[var(--cb-divider)]">{[['newApplications', 'New applications', 'Notify when a candidate applies to an active role'], ['candidateReminders', 'Candidate reminders', 'Surface applications waiting for action'], ['jobExpiryReminders', 'Job expiry', 'Warn before a published role closes'], ['weeklySummary', 'Weekly summary', 'A compact hiring activity summary']].map(([key, title, copy]) => <label key={key} className="flex cursor-pointer items-center justify-between gap-4 py-4"><span><strong className="block text-sm">{title}</strong><span className="mt-1 block text-xs text-[var(--cb-text-muted)]">{copy}</span></span><input aria-label={title} type="checkbox" checked={settings[key]} onChange={(event) => updateSetting(key, event.target.checked)} className="size-4 accent-[var(--cb-primary)]" /></label>)}</div>}</section>
        <section className="surface-card p-6"><div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 shrink-0 text-[var(--cb-emerald)]" /><div><h2 className="font-heading text-lg font-bold">Protected hiring data</h2><p className="mt-2 text-sm leading-6 text-[var(--cb-text-secondary)]">Jobs, status changes, notes, and company edits are persisted through role-authorized backend APIs.</p></div></div></section>
        <section className="rounded-2xl border border-[var(--cb-danger)] bg-[var(--cb-danger-soft)] p-6"><h2 className="font-heading text-lg font-bold text-[var(--cb-danger)]">End recruiter session</h2><p className="mt-2 text-sm text-[var(--cb-text-secondary)]">Logging out securely ends this browser session.</p><Button variant="danger" className="mt-5" onClick={logout} disabled={isLoggingOut}><LogOut />{isLoggingOut ? 'Logging out…' : 'Log out'}</Button></section>
      </div>
    </div>
  );
}
