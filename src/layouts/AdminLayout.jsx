import { useState } from 'react';
import { Menu, ShieldCheck } from 'lucide-react';
import { Outlet, useLocation } from 'react-router-dom';
import { AdminSidebar } from '@/src/components/navigation/AdminSidebar';
import { ThemeToggle } from '@/src/components/navigation/ThemeToggle';
import { Button } from '@/src/components/ui/Button';
import { Drawer, DrawerContent, DrawerTrigger } from '@/src/components/ui/Drawer';

const titles = { '/admin/dashboard': 'Dashboard', '/admin/companies': 'Company reviews', '/admin/jobs': 'Job moderation', '/admin/users': 'User management' };

export function AdminLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  return (
    <div className="min-h-screen bg-[var(--cb-bg)] lg:grid lg:grid-cols-[232px_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-screen border-r border-[var(--cb-divider)] lg:block"><AdminSidebar /></aside>
      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-[var(--cb-divider)] bg-[color-mix(in_srgb,var(--cb-bg)_94%,transparent)] px-4 backdrop-blur-xl sm:px-6">
          <Drawer open={menuOpen} onOpenChange={setMenuOpen}><DrawerTrigger render={<Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open admin navigation" />}><Menu /></DrawerTrigger><DrawerContent title="Platform administration" className="p-0"><AdminSidebar onNavigate={() => setMenuOpen(false)} /></DrawerContent></Drawer>
          <ShieldCheck className="hidden size-5 text-[var(--cb-primary)] sm:block" /><div><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--cb-text-muted)]">Admin</p><p className="font-heading text-sm font-bold">{titles[location.pathname] || 'Platform controls'}</p></div><div className="ml-auto"><ThemeToggle /></div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8"><div className="mx-auto max-w-[1280px]"><Outlet /></div></main>
      </div>
    </div>
  );
}
