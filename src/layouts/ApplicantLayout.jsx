import { Outlet } from 'react-router-dom';
import { ApplicantNavbar } from '@/src/components/navigation/ApplicantNavbar';

export function ApplicantLayout() {
  return (
    <div className="min-h-screen bg-[var(--cb-bg)]">
      <a className="skip-link" href="#applicant-content">Skip to main content</a>
      <ApplicantNavbar />
      <main id="applicant-content" className="app-container py-7 sm:py-9"><Outlet /></main>
    </div>
  );
}
