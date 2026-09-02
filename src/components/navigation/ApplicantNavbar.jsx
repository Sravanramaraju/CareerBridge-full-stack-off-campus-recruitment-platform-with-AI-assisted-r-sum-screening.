import { Bell, Bookmark, ChevronDown, LogOut, Menu, Search, Settings, UserRound } from 'lucide-react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { CareerBridgeLogo } from '@/src/components/brand/CareerBridgeLogo';
import { ThemeToggle } from '@/src/components/navigation/ThemeToggle';
import { Avatar } from '@/src/components/ui/Avatar';
import { Button } from '@/src/components/ui/Button';
import { Drawer, DrawerClose, DrawerContent, DrawerTrigger } from '@/src/components/ui/Drawer';
import { mockNotifications } from '@/src/data/mockData';
import { useAppStore } from '@/src/store/useAppStore';
import { cn } from '@/src/lib/utils';

const links = [
  ['Jobs', '/jobs'], ['Companies', '/companies'], ['Applications', '/applicant/applications'], ['Resources', '/resources'],
];

const accountLinks = [
  ['View profile', '/applicant/profile', UserRound], ['Saved jobs', '/applicant/saved-jobs', Bookmark], ['Notifications', '/applicant/notifications', Bell], ['Settings', '/applicant/settings', Settings],
];

export function ApplicantNavbar() {
  const session = useAppStore((state) => state.session);
  const logout = useAppStore((state) => state.logout);
  const readNotificationIds = useAppStore((state) => state.readNotificationIds);
  const navigate = useNavigate();
  const unreadCount = mockNotifications.filter((item) => !item.read && !readNotificationIds.includes(item.id)).length;

  function handleLogout() {
    logout();
    void navigate('/', { replace: true });
  }

  const navClass = ({ isActive }) => cn('rounded-lg px-3 py-2 text-sm font-semibold transition-colors', isActive ? 'bg-[var(--cb-primary-soft)] text-[var(--cb-primary)]' : 'text-[var(--cb-text-secondary)] hover:bg-[var(--cb-bg-subtle)] hover:text-[var(--cb-text)]');

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--cb-divider)] bg-[color-mix(in_srgb,var(--cb-bg)_92%,transparent)] backdrop-blur-xl">
      <div className="app-container flex h-16 items-center gap-5">
        <CareerBridgeLogo to="/applicant/dashboard" />
        <nav className="hidden flex-1 items-center gap-1 lg:flex" aria-label="Applicant navigation">{links.map(([label, to]) => <NavLink key={to} to={to} className={navClass}>{label}</NavLink>)}</nav>
        <div className="ml-auto flex items-center gap-1">
          <Link to="/jobs" className="hidden rounded-lg p-2 text-[var(--cb-text-secondary)] hover:bg-[var(--cb-bg-subtle)] sm:block" aria-label="Search jobs"><Search className="size-5" /></Link>
          <Link to="/applicant/notifications" className="relative rounded-lg p-2 text-[var(--cb-text-secondary)] hover:bg-[var(--cb-bg-subtle)]" aria-label={`${unreadCount} unread notifications`}><Bell className="size-5" />{unreadCount > 0 && <span className="absolute right-1 top-1 size-2 rounded-full bg-[var(--cb-danger)]" />}</Link>
          <ThemeToggle />
          <details className="relative hidden sm:block">
            <summary className="flex cursor-pointer list-none items-center gap-2 rounded-xl p-1.5 hover:bg-[var(--cb-bg-subtle)]">
              <Avatar name={session?.name} size="sm" /><span className="hidden max-w-28 truncate text-sm font-semibold xl:block">{session?.name}</span><ChevronDown className="size-4 text-[var(--cb-text-muted)]" />
            </summary>
            <div className="absolute right-0 mt-2 w-52 rounded-xl border bg-[var(--cb-surface-raised)] p-2 shadow-[var(--cb-shadow-raised)]">
              {accountLinks.map(([label, to, Icon]) => <Link key={to} to={to} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--cb-text-secondary)] hover:bg-[var(--cb-bg-subtle)] hover:text-[var(--cb-text)]"><Icon className="size-4" />{label}</Link>)}
              <button onClick={handleLogout} type="button" className="mt-1 flex w-full items-center gap-2 border-t border-[var(--cb-divider)] px-3 pt-3 pb-2 text-sm font-semibold text-[var(--cb-danger)]"><LogOut className="size-4" />Log out</button>
            </div>
          </details>
          <Drawer>
            <DrawerTrigger render={<Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu" />}><Menu /></DrawerTrigger>
            <DrawerContent title="CareerBridge" description={session?.email}>
              <nav className="grid gap-1" aria-label="Mobile applicant navigation">
                {[['Dashboard', '/applicant/dashboard'], ...links, ...accountLinks.map(([label, to]) => [label, to])].map(([label, to]) => <DrawerClose key={to} render={<NavLink to={to} className={navClass} />}>{label}</DrawerClose>)}
              </nav>
              <button onClick={handleLogout} type="button" className="mt-5 flex w-full items-center gap-2 border-t border-[var(--cb-divider)] px-3 pt-5 text-sm font-bold text-[var(--cb-danger)]"><LogOut className="size-4" />Log out</button>
            </DrawerContent>
          </Drawer>
        </div>
      </div>
    </header>
  );
}
