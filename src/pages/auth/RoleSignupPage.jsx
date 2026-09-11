import { zodResolver } from '@hookform/resolvers/zod';
import { LoaderCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Button } from '@/src/components/ui/Button';
import { FormField, Input } from '@/src/components/ui/Input';
import { authService } from '@/src/services/authService';
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
  const navigate = useNavigate();
  const setSession = useAppStore((state) => state.setSession);
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(createSignupSchema(accountType)), defaultValues: { name: '', companyName: '', email: '', password: '', confirmPassword: '', acceptedTerms: false } });
  const isRecruiter = accountType === 'recruiter';

  async function onSubmit(values) {
    try {
      const signup = isRecruiter ? authService.signupRecruiter : authService.signupApplicant;
      const session = await signup(values);
      setSession(session);
      void navigate(`/${accountType}/dashboard`, { replace: true });
    } catch (error) {
      if (error?.fields) {
        Object.entries(error.fields).forEach(([field, message]) => {
          if (field in values) setError(field, { type: 'server', message });
        });
      }
      setError('root.server', {
        type: 'server',
        message: error instanceof Error ? error.message : 'Unable to create your account.',
      });
    }
  }

  return (
    <section className="w-full max-w-md">
      <p className="text-sm font-bold text-[var(--cb-primary)]">{isRecruiter ? 'Recruiter account' : 'Candidate account'}</p>
      <h1 className="mt-2 font-heading text-3xl font-extrabold tracking-[-0.035em]">{isRecruiter ? 'Start hiring with clarity' : 'Start building your next step'}</h1>
      <p className="mt-2 text-sm text-[var(--cb-text-secondary)]">Create your secure CareerBridge account and continue to your workspace.</p>
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
        {errors.root?.server && <p role="alert" className="rounded-xl border border-[var(--cb-danger)] bg-[var(--cb-danger-soft)] p-3 text-sm text-[var(--cb-danger)]">{errors.root.server.message}</p>}
        <Button type="submit" size="lg" className="mt-2" disabled={isSubmitting}>{isSubmitting && <LoaderCircle className="animate-spin" />}{isSubmitting ? 'Creating account…' : 'Create account'}</Button>
      </form>
      <p className="mt-6 text-center text-sm text-[var(--cb-text-secondary)]">Already registered? <Link to="/login" className="font-bold text-[var(--cb-primary)] hover:underline">Log in</Link></p>
    </section>
  );
}
