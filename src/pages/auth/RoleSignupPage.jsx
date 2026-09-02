import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, LoaderCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Button } from '@/src/components/ui/Button';
import { FormField, Input } from '@/src/components/ui/Input';
import { useAppStore } from '@/src/store/useAppStore';
import { useDocumentTitle } from '@/src/hooks/useDocumentTitle';

function createSignupSchema(accountType) {
  return z.object({
  name: z.string().min(2, 'Enter your full name.'),
  companyName: z.string(),
  email: z.email('Enter a valid email address.'),
  password: z.string().min(8, 'Use at least 8 characters.'),
  confirmPassword: z.string(),
  acceptedTerms: z.boolean().refine(Boolean, 'Accept the terms to continue.'),
  })
    .refine((values) => values.password === values.confirmPassword, { message: 'Passwords do not match.', path: ['confirmPassword'] })
    .refine((values) => accountType !== 'recruiter' || values.companyName.trim().length >= 2, { message: 'Enter your company name.', path: ['companyName'] });
}

export function RoleSignupPage({ accountType }) {
  useDocumentTitle(accountType === 'recruiter' ? 'Recruiter sign up' : 'Applicant sign up');
  const [complete, setComplete] = useState(false);
  const navigate = useNavigate();
  const setSession = useAppStore((state) => state.setSession);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(createSignupSchema(accountType)), defaultValues: { name: '', companyName: '', email: '', password: '', confirmPassword: '', acceptedTerms: false } });
  const isRecruiter = accountType === 'recruiter';

  async function onSubmit(values) {
    await new Promise((resolve) => window.setTimeout(resolve, 450));
    setSession({ id: `local-${accountType}-${values.email}`, name: values.name, email: values.email, role: accountType });
    setComplete(true);
    window.setTimeout(() => void navigate(`/${accountType}/dashboard`, { replace: true }), 650);
  }

  if (complete) return <section className="w-full max-w-md text-center"><span className="mx-auto grid size-14 place-items-center rounded-full bg-[var(--cb-emerald)] text-white"><Check /></span><h1 className="mt-5 font-heading text-2xl font-extrabold">Your workspace is ready</h1><p className="mt-2 text-sm text-[var(--cb-text-secondary)]">Taking you to your {accountType} dashboard…</p></section>;

  return (
    <section className="w-full max-w-md">
      <p className="text-sm font-bold text-[var(--cb-primary)]">{isRecruiter ? 'Recruiter account' : 'Candidate account'}</p>
      <h1 className="mt-2 font-heading text-3xl font-extrabold tracking-[-0.035em]">{isRecruiter ? 'Start hiring with clarity' : 'Start building your next step'}</h1>
      <p className="mt-2 text-sm text-[var(--cb-text-secondary)]">This creates a local demo account for the portfolio experience.</p>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-7 grid gap-4" noValidate>
        <FormField label="Full name" error={errors.name?.message} required>{(field) => <Input {...field} autoComplete="name" placeholder="Your full name" {...register('name')} />}</FormField>
        {isRecruiter && <FormField label="Company name" error={errors.companyName?.message} required>{(field) => <Input {...field} autoComplete="organization" placeholder="Your organization" {...register('companyName')} />}</FormField>}
        <FormField label="Email address" error={errors.email?.message} required>{(field) => <Input {...field} type="email" autoComplete="email" placeholder="you@example.com" {...register('email')} />}</FormField>
        <FormField label="Password" error={errors.password?.message} required>{(field) => <Input {...field} type="password" autoComplete="new-password" placeholder="At least 8 characters" {...register('password')} />}</FormField>
        <FormField label="Confirm password" error={errors.confirmPassword?.message} required>{(field) => <Input {...field} type="password" autoComplete="new-password" placeholder="Repeat your password" {...register('confirmPassword')} />}</FormField>
        <div>
          <label className="flex items-start gap-2 text-xs leading-5 text-[var(--cb-text-secondary)]"><input type="checkbox" className="mt-0.5 size-4 shrink-0 accent-[var(--cb-primary)]" aria-invalid={Boolean(errors.acceptedTerms)} {...register('acceptedTerms')} /><span>I agree to the <Link to="/resources" className="font-bold text-[var(--cb-primary)] hover:underline">platform terms and responsible-use policy</Link>.</span></label>
          {errors.acceptedTerms && <p className="mt-1 text-xs text-[var(--cb-danger)]" role="alert">{errors.acceptedTerms.message}</p>}
        </div>
        <Button type="submit" size="lg" className="mt-2" disabled={isSubmitting}>{isSubmitting && <LoaderCircle className="animate-spin" />}{isSubmitting ? 'Creating account…' : 'Create account'}</Button>
      </form>
      <p className="mt-6 text-center text-sm text-[var(--cb-text-secondary)]">Already registered? <Link to="/login" className="font-bold text-[var(--cb-primary)] hover:underline">Log in</Link></p>
    </section>
  );
}
