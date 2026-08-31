import { Link } from 'react-router-dom';
import { CareerBridgeLogo } from '@/src/components/brand/CareerBridgeLogo';

const footerGroups = [
  {
    title: 'Candidates',
    links: [['Browse jobs', '/jobs'], ['Explore companies', '/companies'], ['Career resources', '/resources']],
  },
  {
    title: 'Employers',
    links: [['Post a job', '/signup/recruiter'], ['Recruiter login', '/login'], ['Hiring guide', '/resources']],
  },
  {
    title: 'CareerBridge',
    links: [['About the platform', '/#about'], ['How it works', '/#how-it-works'], ['Support', '/resources']],
  },
];

export function PublicFooter() {
  return (
    <footer className="border-t border-[var(--cb-divider)] bg-[var(--cb-surface)]">
      <div className="page-container grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.5fr_repeat(3,1fr)]">
        <div className="max-w-sm">
          <CareerBridgeLogo />
          <p className="mt-4 text-sm leading-6 text-[var(--cb-text-secondary)]">
            A clearer path from potential to opportunity for emerging talent and thoughtful employers.
          </p>
          <p className="mt-5 text-xs text-[var(--cb-text-muted)]">Made for India&apos;s early-career talent.</p>
        </div>
        {footerGroups.map((group) => (
          <div key={group.title}>
            <h2 className="font-heading text-sm font-bold">{group.title}</h2>
            <ul className="mt-4 space-y-3 text-sm text-[var(--cb-text-secondary)]">
              {group.links.map(([label, to]) => (
                <li key={label}><Link className="hover:text-[var(--cb-primary)]" to={to}>{label}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-[var(--cb-divider)]">
        <div className="page-container flex flex-col gap-2 py-5 text-xs text-[var(--cb-text-muted)] sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 CareerBridge. A portfolio demonstration platform.</p>
          <p>Privacy-minded by design · Accessible by default</p>
        </div>
      </div>
    </footer>
  );
}
