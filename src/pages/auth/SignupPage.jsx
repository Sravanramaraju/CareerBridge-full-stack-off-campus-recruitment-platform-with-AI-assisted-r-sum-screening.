import { ArrowRight, BriefcaseBusiness, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';

const roles = [
  {
    to: '/signup/applicant',
    icon: UserRound,
    title: 'I’m looking for opportunities',
    description: 'Build your profile, save roles, apply, and follow every update.',
    label: 'Continue as candidate',
  },
  {
    to: '/signup/recruiter',
    icon: BriefcaseBusiness,
    title: 'I’m hiring emerging talent',
    description: 'Publish clear roles and manage candidates through a focused workflow.',
    label: 'Continue as recruiter',
  },
];

export function SignupPage() {
  return (
    <section className="w-full max-w-xl">
      <p className="text-sm font-bold text-[var(--cb-primary)]">Join CareerBridge</p>
      <h1 className="mt-2 font-heading text-3xl font-extrabold tracking-[-0.035em]">How will you use the platform?</h1>
      <p className="mt-2 text-sm text-[var(--cb-text-secondary)]">Choose a workspace. You can explore both through the visible demo accounts anytime.</p>
      <div className="mt-8 grid gap-4">
        {roles.map(({ to, icon: Icon, title, description, label }) => (
          <Link key={to} to={to} className="group surface-card flex items-start gap-4 p-5 transition-[border-color,transform,box-shadow] hover:-translate-y-0.5 hover:border-[var(--cb-primary)] hover:shadow-[var(--cb-shadow-raised)]">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[var(--cb-primary-soft)] text-[var(--cb-primary)]"><Icon /></span>
            <span className="min-w-0 flex-1"><strong className="font-heading text-base">{title}</strong><span className="mt-1 block text-sm leading-6 text-[var(--cb-text-secondary)]">{description}</span><span className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-[var(--cb-primary)]">{label}<ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" /></span></span>
          </Link>
        ))}
      </div>
      <p className="mt-6 text-center text-sm text-[var(--cb-text-secondary)]">Already have an account? <Link to="/login" className="font-bold text-[var(--cb-primary)] hover:underline">Log in</Link></p>
    </section>
  );
}
