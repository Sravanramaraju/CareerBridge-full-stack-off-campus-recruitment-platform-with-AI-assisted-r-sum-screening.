import { Bell, BriefcaseBusiness, Building2, CircleHelp, LayoutDashboard, LogOut, Settings, UserRoundSearch } from 'lucide-react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { CareerBridgeLogo } from '@/src/components/brand/CareerBridgeLogo';
import { Avatar } from '@/src/components/ui/Avatar';
import { buttonVariants } from '@/src/components/ui/Button';
import { useAppStore } from '@/src/store/useAppStore';
import { cn } from '@/src/lib/utils';

const navItems = [
  ['Overview', '/recruiter/dashboard', LayoutDashboard],
  ['Jobs', '/recruiter/jobs', BriefcaseBusiness],
  ['Candidates', '/recruiter/jobs/frontend-engineer-northstar/applicants', UserRoundSearch],
  ['Company profile', '/recruiter/company', Building2],
  ['Notifications', '/recruiter/notifications', Bell],
];

export function RecruiterSidebar({ onNavigate }) {
  const session = useAppStore((state) => state.session);
  const logout = useAppStore((state) => state.logout);
  const navigate = useNavigate();
  function handleLogout() { logout(); void navigate('/', { replace: true }); }

  return (
    <div className="flex h-full flex-col bg-[var(--cb-surface)] p-4">
      <CareerBridgeLogo to="/recruiter/dashboard" className="px-2 py-1" />
      <Link to="/recruiter/jobs/new" onClick={onNavigate} className={cn(buttonVariants({ variant: 'primary', size: 'lg' }), 'mt-7 w-full')}><BriefcaseBusiness />Post a job</Link>
      <nav className="mt-7 grid gap-1" aria-label="Recruiter navigation">
        {navItems.map(([label, to, Icon]) => <NavLink key={to} to={to} onClick={onNavigate} className={({ isActive }) => cn('flex items-center gap-3 rounded-[10px] border-l-[3px] px-3 py-2.5 text-sm font-semibold transition-colors', isActive ? 'border-l-[var(--cb-primary)] bg-[var(--cb-primary-soft)] text-[var(--cb-primary)]' : 'border-l-transparent text-[var(--cb-text-secondary)] hover:bg-[var(--cb-bg-subtle)] hover:text-[var(--cb-text)]')}><Icon className="size-[18px]" />{label}</NavLink>)}
      </nav>
      <div className="mt-auto border-t border-[var(--cb-divider)] pt-4">
        <Link to="/recruiter/settings" onClick={onNavigate} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-[var(--cb-text-secondary)] hover:bg-[var(--cb-bg-subtle)]"><Settings className="size-[18px]" />Settings</Link>
        <Link to="/resources" onClick={onNavigate} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-[var(--cb-text-secondary)] hover:bg-[var(--cb-bg-subtle)]"><CircleHelp className="size-[18px]" />Help</Link>
        <div className="mt-3 flex items-center gap-2 border-t border-[var(--cb-divider)] pt-4"><Avatar name={session?.name} size="sm" /><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold">{session?.name}</p><p className="truncate text-[10px] text-[var(--cb-text-muted)]">{session?.email}</p></div><button type="button" onClick={handleLogout} className="rounded-lg p-2 text-[var(--cb-text-muted)] hover:bg-[var(--cb-danger-soft)] hover:text-[var(--cb-danger)]" aria-label="Log out"><LogOut className="size-4" /></button></div>
      </div>
    </div>
  );
}
