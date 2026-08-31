import { Outlet } from 'react-router-dom';
import { PublicFooter } from '@/src/components/navigation/PublicFooter';
import { PublicNavbar } from '@/src/components/navigation/PublicNavbar';

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <PublicNavbar />
      <main id="main-content"><Outlet /></main>
      <PublicFooter />
    </div>
  );
}
