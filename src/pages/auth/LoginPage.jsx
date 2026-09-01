import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Info, LoaderCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { Button } from '@/src/components/ui/Button';
import { FormField, Input } from '@/src/components/ui/Input';
import { DEMO_ACCOUNTS } from '@/src/domain/constants';
import { authService } from '@/src/services/mockApi';
import { useAppStore } from '@/src/store/useAppStore';
import { useDocumentTitle } from '@/src/hooks/useDocumentTitle';

const loginSchema = z.object({
  email: z.email('Enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
});

const roleHome = { applicant: '/applicant/dashboard', recruiter: '/recruiter/dashboard', admin: '/admin/dashboard' };

export function LoginPage() {
  useDocumentTitle('Log in');
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setSession = useAppStore((state) => state.setSession);
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(values) {
    setServerError('');
    try {
      const session = await authService.login(values.email, values.password);
      setSession(session);
      const requestedPath = searchParams.get('redirect');
      const destination = requestedPath && session.role === 'applicant' ? requestedPath : roleHome[session.role];
      void navigate(destination, { replace: true });
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Unable to log in.');
    }
  }

  function fillDemoAccount(account) {
    setValue('email', account.email, { shouldValidate: true });
    setValue('password', account.password, { shouldValidate: true });
  }

  return (
    <section className="w-full max-w-md">
      <p className="text-sm font-bold text-[var(--cb-primary)]">Welcome back</p>
      <h1 className="mt-2 font-heading text-3xl font-extrabold tracking-[-0.035em]">Log in to CareerBridge</h1>
      <p className="mt-2 text-sm text-[var(--cb-text-secondary)]">Access your applications, hiring workspace, or platform controls.</p>

      <form className="mt-7 grid gap-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormField label="Email address" error={errors.email?.message} required>{(field) => <Input {...field} type="email" autoComplete="email" placeholder="you@example.com" {...register('email')} />}</FormField>
        <FormField label="Password" error={errors.password?.message} required>{(field) => (
          <div className="relative">
            <Input {...field} type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Enter your password" className="pr-11" {...register('password')} />
            <button type="button" onClick={() => setShowPassword((current) => !current)} className="absolute right-1.5 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-[var(--cb-text-muted)] hover:bg-[var(--cb-bg-subtle)]" aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button>
          </div>
        )}</FormField>
        <div className="-mt-2 flex justify-end"><Link to="/forgot-password" className="text-xs font-bold text-[var(--cb-primary)] hover:underline">Forgot password?</Link></div>
        {serverError && <p role="alert" className="rounded-xl border border-[var(--cb-danger)] bg-[var(--cb-danger-soft)] p-3 text-sm text-[var(--cb-danger)]">{serverError}</p>}
        <Button type="submit" size="lg" disabled={isSubmitting}>{isSubmitting && <LoaderCircle className="animate-spin" />} {isSubmitting ? 'Logging in…' : 'Log in'}</Button>
      </form>

      <div className="mt-7 rounded-xl border border-[var(--cb-border)] bg-[var(--cb-bg-subtle)] p-4">
        <p className="flex items-center gap-2 text-xs font-bold"><Info className="size-4 text-[var(--cb-primary)]" />Demo accounts</p>
        <p className="mt-1 text-xs leading-5 text-[var(--cb-text-muted)]">Choose a role to fill its credentials. All passwords are <strong>demo1234</strong>.</p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {DEMO_ACCOUNTS.map((account) => <button key={account.role} type="button" onClick={() => fillDemoAccount(account)} className="rounded-lg border bg-[var(--cb-surface)] px-2 py-2 text-xs font-bold capitalize text-[var(--cb-text-secondary)] hover:border-[var(--cb-primary)] hover:text-[var(--cb-primary)]">{account.role}</button>)}
        </div>
      </div>
      <p className="mt-6 text-center text-sm text-[var(--cb-text-secondary)]">New to CareerBridge? <Link to="/signup" className="font-bold text-[var(--cb-primary)] hover:underline">Create an account</Link></p>
    </section>
  );
}
