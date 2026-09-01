import { Bell, Menu } from 'lucide-react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { RecruiterSidebar } from '@/src/components/navigation/RecruiterSidebar';
import { ThemeToggle } from '@/src/components/navigation/ThemeToggle';
import { Button } from '@/src/components/ui/Button';
import { Drawer, DrawerClose, DrawerContent, DrawerTrigger } from '@/src/components/ui/Drawer';
import { recruiterNotifications } from '@/src/data/mockData';

const titles = {
  '/recruiter/dashboard': 'Overview', '/recruiter/jobs': 'Jobs', '/recruiter/company': 'Company profile',
  '/recruiter/notifications': 'Notifications', '/recruiter/settings': 'Settings',
};

export function RecruiterLayout() {
  const location = useLocation();
  const title = titles[location.pathname] || (location.pathname.includes('/applicants') ? 'Candidate pipeline' : location.pathname.includes('/candidates/') ? 'Candidate profile' : location.pathname.includes('/jobs/new') ? 'Post a job' : location.pathname.includes('/edit') ? 'Edit job' : 'Recruiter workspace');
  const unread = recruiterNotifications.filter((item) => !item.read).length;

  return (
    <div className="min-h-screen bg-[var(--cb-bg)] lg:grid lg:grid-cols-[244px_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-screen border-r border-[var(--cb-divider)] lg:block"><RecruiterSidebar /></aside>
      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-[var(--cb-divider)] bg-[color-mix(in_srgb,var(--cb-bg)_94%,transparent)] px-4 backdrop-blur-xl sm:px-6">
          <Drawer>
            <DrawerTrigger render={<Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open recruiter navigation" />}><Menu /></DrawerTrigger>
            <DrawerContent title="Recruiter workspace" className="p-0"><DrawerClose render={<div />} /><RecruiterSidebar /></DrawerContent>
          </Drawer>
          <div><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--cb-text-muted)]">Recruiter</p><p className="font-heading text-sm font-bold">{title}</p></div>
          <div className="ml-auto flex items-center gap-1"><Link to="/recruiter/notifications" className="relative rounded-lg p-2 text-[var(--cb-text-secondary)] hover:bg-[var(--cb-bg-subtle)]" aria-label={`${unread} unread notifications`}><Bell className="size-5" />{unread > 0 && <span className="absolute right-1 top-1 size-2 rounded-full bg-[var(--cb-danger)]" />}</Link><ThemeToggle /></div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8"><div className="mx-auto max-w-[1320px]"><Outlet /></div></main>
      </div>
    </div>
  );
}
