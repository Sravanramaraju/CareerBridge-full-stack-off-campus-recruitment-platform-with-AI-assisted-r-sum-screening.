import { BriefcaseBusiness, Building2, LayoutDashboard, LogOut, ShieldCheck, UsersRound } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { CareerBridgeLogo } from '@/src/components/brand/CareerBridgeLogo';
import { Avatar } from '@/src/components/ui/Avatar';
import { useAppStore } from '@/src/store/useAppStore';
import { cn } from '@/src/lib/utils';

const items = [
  ['Dashboard', '/admin/dashboard', LayoutDashboard],
  ['Companies', '/admin/companies', Building2],
  ['Jobs', '/admin/jobs', BriefcaseBusiness],
  ['Users', '/admin/users', UsersRound],
];

export function AdminSidebar({ onNavigate }) {
  const session = useAppStore((state) => state.session);
  const logout = useAppStore((state) => state.logout);
  const navigate = useNavigate();
  function handleLogout() { logout(); void navigate('/', { replace: true }); }

  return (
    <div className="flex h-full flex-col bg-[var(--cb-surface)] p-4">
      <CareerBridgeLogo to="/admin/dashboard" className="px-2 py-1" />
      <div className="mx-2 mt-6 flex items-center gap-2 rounded-lg bg-[var(--cb-info-soft)] px-3 py-2 text-xs font-bold text-[var(--cb-info)]"><ShieldCheck className="size-4" />Platform administration</div>
      <nav className="mt-5 grid gap-1" aria-label="Admin navigation">{items.map(([label, to, Icon]) => <NavLink key={to} to={to} onClick={onNavigate} className={({ isActive }) => cn('flex items-center gap-3 rounded-[10px] border-l-[3px] px-3 py-2.5 text-sm font-semibold', isActive ? 'border-l-[var(--cb-primary)] bg-[var(--cb-primary-soft)] text-[var(--cb-primary)]' : 'border-l-transparent text-[var(--cb-text-secondary)] hover:bg-[var(--cb-bg-subtle)]')}><Icon className="size-[18px]" />{label}</NavLink>)}</nav>
      <div className="mt-auto border-t border-[var(--cb-divider)] pt-4"><div className="flex items-center gap-2"><Avatar name={session?.name} size="sm" /><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold">{session?.name}</p><p className="truncate text-[10px] text-[var(--cb-text-muted)]">{session?.email}</p></div><button type="button" onClick={handleLogout} className="rounded-lg p-2 text-[var(--cb-text-muted)] hover:bg-[var(--cb-danger-soft)] hover:text-[var(--cb-danger)]" aria-label="Log out"><LogOut className="size-4" /></button></div></div>
    </div>
  );
}
