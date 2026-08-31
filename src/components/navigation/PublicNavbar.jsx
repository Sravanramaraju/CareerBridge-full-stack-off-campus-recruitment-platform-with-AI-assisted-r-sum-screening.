import { Menu } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import { CareerBridgeLogo } from '@/src/components/brand/CareerBridgeLogo';
import { ThemeToggle } from '@/src/components/navigation/ThemeToggle';
import { buttonVariants, Button } from '@/src/components/ui/Button';
import { Drawer, DrawerClose, DrawerContent, DrawerTrigger } from '@/src/components/ui/Drawer';
import { cn } from '@/src/lib/utils';

const navigation = [
  { label: 'Find jobs', to: '/jobs' },
  { label: 'Companies', to: '/companies' },
  { label: 'Career resources', to: '/resources' },
];

function DesktopNavigation() {
  return (
    <nav aria-label="Primary navigation" className="hidden items-center gap-1 lg:flex">
      {navigation.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) => cn(
            'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
            isActive
              ? 'bg-[var(--cb-primary-soft)] text-[var(--cb-primary)]'
              : 'text-[var(--cb-text-secondary)] hover:bg-[var(--cb-bg-subtle)] hover:text-[var(--cb-text)]',
          )}
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

export function PublicNavbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--cb-divider)] bg-[color-mix(in_srgb,var(--cb-bg)_92%,transparent)] backdrop-blur-xl">
      <div className="page-container flex h-16 items-center justify-between gap-4">
        <CareerBridgeLogo />
        <DesktopNavigation />
        <div className="hidden items-center gap-2 lg:flex">
          <ThemeToggle />
          <Link to="/login" className={buttonVariants({ variant: 'ghost', size: 'md' })}>Log in</Link>
          <Link to="/signup" className={buttonVariants({ variant: 'primary', size: 'md' })}>Create account</Link>
        </div>

        <div className="flex items-center gap-1 lg:hidden">
          <ThemeToggle />
          <Drawer>
            <DrawerTrigger render={<Button variant="ghost" size="icon" aria-label="Open navigation" />}>
              <Menu aria-hidden="true" />
            </DrawerTrigger>
            <DrawerContent title="Explore CareerBridge" description="Jobs, companies, and career support.">
              <nav aria-label="Mobile navigation" className="flex flex-col gap-1">
                {navigation.map((item) => (
                  <DrawerClose
                    key={item.to}
                    render={<Link to={item.to} className="rounded-xl px-3 py-3 font-semibold text-[var(--cb-text-secondary)] hover:bg-[var(--cb-bg-subtle)] hover:text-[var(--cb-text)]" />}
                  >
                    {item.label}
                  </DrawerClose>
                ))}
              </nav>
              <div className="mt-6 grid gap-2 border-t border-[var(--cb-divider)] pt-5">
                <DrawerClose render={<Link to="/login" className={buttonVariants({ variant: 'secondary', size: 'lg' })} />}>Log in</DrawerClose>
                <DrawerClose render={<Link to="/signup" className={buttonVariants({ variant: 'primary', size: 'lg' })} />}>Create account</DrawerClose>
              </div>
              <p className="mt-6 text-xs leading-5 text-[var(--cb-text-muted)]">Built for transparent, skills-first early-career hiring.</p>
            </DrawerContent>
          </Drawer>
        </div>
      </div>
    </header>
  );
}
